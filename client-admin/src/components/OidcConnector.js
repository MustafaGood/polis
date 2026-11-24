// Copyright (C) 2012-present, The Authors. This program is free software: you can redistribute it and/or  modify it under the terms of the GNU Affero General Public License, version 3, as published by the Free Software Foundation. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'
import { setOidcTokenGetter, setOidcActions } from '../util/net'
import { getOidcApiToken } from '../util/oidcToken'

const OidcConnector = () => {
  const auth = useAuth()
  const authWasReady = useRef(false)

  useEffect(() => {
    // Always set up auth actions for error handling and sign-in
    // Only set if the methods are available
    if (auth.signinRedirect && auth.removeUser) {
      setOidcActions({
        signinRedirect: () => auth.signinRedirect(),
        removeUser: () => auth.removeUser()
      })
    }

    // Set up the token getter function for the network utility when authenticated
    if (process.env.AUTH_CLIENT_ID && auth.isAuthenticated && !auth.isLoading) {
      const tokenGetter = async () => {
        try {
          const currentToken = getOidcApiToken(
            auth.user,
            process.env.AUTH_ISSUER
          )

          if (currentToken) {
            // Check if token is expired or about to expire
            const expiresAt = auth.user.expires_at
            const now = Math.floor(Date.now() / 1000)
            const TOKEN_EXPIRY_BUFFER = 60 // 60 seconds buffer

            if (expiresAt && now >= expiresAt - TOKEN_EXPIRY_BUFFER) {
              // Token is expired or about to expire, attempt silent refresh
              try {
                const user = await auth.signinSilent()
                const refreshedToken = getOidcApiToken(
                  user,
                  process.env.AUTH_ISSUER
                )
                if (refreshedToken) {
                  return refreshedToken
                }
              } catch (silentError) {
                // Token is stale and refresh failed - clear it
                if (silentError.error === 'login_required') {
                  await auth.removeUser()
                  return null
                }
                throw silentError
              }
            }

            // Token is still valid
            return currentToken
          }

          // If we don't have a token yet, try signinSilent to refresh
          const user = await auth.signinSilent()
          const refreshedToken = getOidcApiToken(
            user,
            process.env.AUTH_ISSUER
          )
          if (refreshedToken) {
            return refreshedToken
          }

          // Final check after signinSilent
          const fallbackToken = getOidcApiToken(
            auth.user,
            process.env.AUTH_ISSUER
          )
          if (fallbackToken) {
            return fallbackToken
          }

          return null
        } catch (error) {
          // If it's a login_required error, don't throw - let the caller handle it
          if (error.error === 'login_required') {
            // Clear any stale auth state
            await auth.removeUser()
            return null
          }

          throw error
        }
      }

      setOidcTokenGetter(tokenGetter)

      // Dispatch event when auth becomes ready for the first time
      if (!authWasReady.current) {
        authWasReady.current = true
        window.dispatchEvent(new Event('polisAuthReady'))
      }
    } else if (!auth.isAuthenticated && !auth.isLoading) {
      // Clear the token getter when not authenticated
      setOidcTokenGetter(null)
      authWasReady.current = false
    }

    // Clear actions on unmount or when auth object changes without required methods
    return () => {
      if (!auth.signinRedirect || !auth.removeUser) {
        setOidcActions(null)
      }
    }
  }, [auth])

  // This component doesn't render anything
  return null
}

export default OidcConnector

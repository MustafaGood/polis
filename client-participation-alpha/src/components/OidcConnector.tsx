import { useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'
import { setOidcActions, setOidcTokenGetter } from '../lib/net'

/**
 * Wires react-oidc-context into PolisNet (same pattern as client-admin OidcConnector).
 * Renders nothing.
 */
export default function OidcConnector() {
  const auth = useAuth()
  const authWasReady = useRef(false)

  useEffect(() => {
    setOidcActions({
      signinRedirect: () => {
        void auth.signinRedirect()
      }
    })

    if (auth.isAuthenticated && !auth.isLoading) {
      const tokenGetter = async () => {
        try {
          if (auth.user?.access_token) {
            const expiresAt = auth.user.expires_at
            const now = Math.floor(Date.now() / 1000)
            const TOKEN_EXPIRY_BUFFER = 60

            if (expiresAt && now >= expiresAt - TOKEN_EXPIRY_BUFFER) {
              try {
                const user = await auth.signinSilent()
                if (user?.access_token) {
                  return user.access_token
                }
              } catch (silentError: unknown) {
                const err = silentError as { error?: string }
                if (err.error === 'login_required') {
                  await auth.removeUser()
                  return null
                }
                throw silentError
              }
            }

            return auth.user.access_token
          }

          const user = await auth.signinSilent()
          if (user?.access_token) {
            return user.access_token
          }

          return auth.user?.access_token ?? null
        } catch (error: unknown) {
          const err = error as { error?: string }
          if (err.error === 'login_required') {
            await auth.removeUser()
            return null
          }
          throw error
        }
      }

      setOidcTokenGetter(tokenGetter)

      if (!authWasReady.current) {
        authWasReady.current = true
        window.dispatchEvent(new Event('polisAuthReady'))
      }
    } else if (!auth.isAuthenticated && !auth.isLoading) {
      setOidcTokenGetter(null)
      authWasReady.current = false
    }

    return () => {
      setOidcActions(null)
    }
  }, [auth])

  return null
}

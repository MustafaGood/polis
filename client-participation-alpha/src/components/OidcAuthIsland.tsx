import { AuthProvider } from 'react-oidc-context'
import { WebStorageStateStore, type User } from 'oidc-client-ts'
import type { Translations } from '../strings/types'
import OidcConnector from './OidcConnector'
import ParticipantOidcLogin from './ParticipantOidcLogin'

interface OidcAuthIslandProps {
  s: Translations
}

function isOidcLoginEnabled(): boolean {
  const flag = import.meta.env.PUBLIC_ENABLE_OIDC_LOGIN
  return flag === 'true' || flag === '1'
}

function getOidcConfig() {
  const authority = import.meta.env.PUBLIC_AUTH_ISSUER
  const clientId = import.meta.env.PUBLIC_AUTH_CLIENT_ID
  const audience = import.meta.env.PUBLIC_AUTH_AUDIENCE

  if (!authority || !clientId || !audience) {
    return null
  }

  const redirectUri = `${window.location.origin}${window.location.pathname}`

  return {
    authority,
    client_id: clientId,
    redirect_uri: redirectUri,
    post_logout_redirect_uri: redirectUri,
    scope: 'openid profile email',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    extraQueryParams: { audience },
    onSigninCallback: (user: User | void) => {
      const state = user?.state as { returnTo?: string } | undefined
      const returnTo = state?.returnTo || window.location.pathname
      // Restore pre-login path (without OIDC ?code=&state= callback params).
      window.history.replaceState({}, document.title, returnTo)
    }
  }
}

/**
 * Client-only island: enables participant OIDC when PUBLIC_ENABLE_OIDC_LOGIN is set
 * and AUTH_* public env vars are present (simulator today, Idura later).
 */
export default function OidcAuthIsland({ s }: OidcAuthIslandProps) {
  if (!isOidcLoginEnabled()) {
    return null
  }

  const oidcConfig = getOidcConfig()
  if (!oidcConfig) {
    console.warn(
      '[OIDC PoC] PUBLIC_ENABLE_OIDC_LOGIN is on but PUBLIC_AUTH_ISSUER / CLIENT_ID / AUDIENCE are incomplete'
    )
    return null
  }

  return (
    <AuthProvider {...oidcConfig}>
      <OidcConnector />
      <ParticipantOidcLogin s={s} />
    </AuthProvider>
  )
}

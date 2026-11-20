import { AuthProvider } from 'react-oidc-context'
import { WebStorageStateStore, type User } from 'oidc-client-ts'
import { CriiptoVerifyProvider } from '@criipto/verify-react'
import type { Translations } from '../strings/types'
import OidcConnector from './OidcConnector'
import ParticipantOidcLogin from './ParticipantOidcLogin'
import IduraConnector from './IduraConnector'
import ParticipantIduraLogin from './ParticipantIduraLogin'
import IduraCallback from './IduraCallback'
import {
  getIduraDomain,
  getParticipantRedirectUri,
  isIduraIssuer,
  isOidcLoginEnabled
} from '../lib/idura'
import {
  getIduraRedirectUri,
  IDURA_CALLBACK_PATH
} from '../lib/iduraRedirect'

interface OidcAuthIslandProps {
  s: Translations
}

function getSimulatorOidcConfig() {
  const authority = import.meta.env.PUBLIC_AUTH_ISSUER
  const clientId = import.meta.env.PUBLIC_AUTH_CLIENT_ID
  const audience = import.meta.env.PUBLIC_AUTH_AUDIENCE

  if (!authority || !clientId) {
    return null
  }

  const redirectUri = getParticipantRedirectUri()

  return {
    authority,
    client_id: clientId,
    redirect_uri: redirectUri,
    post_logout_redirect_uri: redirectUri,
    scope: 'openid profile email',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    ...(audience ? { extraQueryParams: { audience } } : {}),
    onSigninCallback: (user: User | void) => {
      const state = user?.state as { returnTo?: string } | undefined
      const returnTo = state?.returnTo || window.location.pathname
      window.history.replaceState({}, document.title, returnTo)
    }
  }
}

/**
 * Participant auth island:
 * - Idura issuer → @criipto/verify-react (BankID/Freja method selector)
 * - Other issuers (oidc-simulator) → react-oidc-context
 */
export default function OidcAuthIsland({ s }: OidcAuthIslandProps) {
  if (!isOidcLoginEnabled()) {
    return null
  }

  const issuer = import.meta.env.PUBLIC_AUTH_ISSUER
  const clientId = import.meta.env.PUBLIC_AUTH_CLIENT_ID

  if (!issuer || !clientId) {
    console.warn(
      '[OIDC PoC] PUBLIC_ENABLE_OIDC_LOGIN is on but PUBLIC_AUTH_ISSUER / CLIENT_ID are incomplete'
    )
    return null
  }

  if (isIduraIssuer(issuer)) {
    const domain = getIduraDomain(issuer)
    if (!domain) {
      console.warn('[OIDC PoC] Could not parse Idura domain from PUBLIC_AUTH_ISSUER')
      return null
    }

    return (
      <CriiptoVerifyProvider
        domain={domain}
        clientID={clientId}
        redirectUri={getIduraRedirectUri()}
        sessionStore={window.sessionStorage}>
        {window.location.pathname.replace(/\/$/, '') === IDURA_CALLBACK_PATH ? (
          <IduraCallback s={s} />
        ) : (
          <>
            <IduraConnector />
            <ParticipantIduraLogin s={s} />
          </>
        )}
      </CriiptoVerifyProvider>
    )
  }

  const oidcConfig = getSimulatorOidcConfig()
  if (!oidcConfig) {
    return null
  }

  return (
    <AuthProvider {...oidcConfig}>
      <OidcConnector />
      <ParticipantOidcLogin s={s} />
    </AuthProvider>
  )
}

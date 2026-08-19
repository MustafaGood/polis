import { useAuth } from 'react-oidc-context'
import type { Translations } from '../strings/types'

interface ParticipantOidcLoginProps {
  s: Translations
}

/**
 * Minimal participant OIDC login control for Alt 2.3 PoC (oidc-simulator / Idura later).
 */
export default function ParticipantOidcLogin({ s }: ParticipantOidcLoginProps) {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="oidc-login-bar" role="status">
        {s.loading}
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="oidc-login-bar" role="alert">
        {s.error}: {auth.error.message}
      </div>
    )
  }

  if (auth.isAuthenticated) {
    const label = auth.user?.profile?.email || auth.user?.profile?.sub || 'OIDC'
    return (
      <div className="oidc-login-bar">
        <span>
          {s.oidcSignedInAs.replace('{{email}}', String(label))}
        </span>
        <button
          type="button"
          className="submit-button"
          onClick={() => {
            void auth.removeUser()
          }}>
          {s.oidcSignOut}
        </button>
      </div>
    )
  }

  return (
    <div className="oidc-login-bar">
      <button
        type="button"
        className="submit-button"
        id="participant-oidc-signin"
        onClick={() =>
          void auth.signinRedirect({
            state: { returnTo: window.location.pathname + window.location.search }
          })
        }>
        {s.oidcSignIn}
      </button>
    </div>
  )
}

import { useEffect } from 'react'
import { useAuth } from 'react-oidc-context'
import type { Translations } from '../strings/types'

interface ParticipantOidcLoginProps {
  s: Translations
}

function isUserCanceledOidcError(error: Error): boolean {
  const msg = `${error.name} ${error.message}`.toLowerCase()
  return (
    msg.includes('access_denied') ||
    msg.includes('user canceled') ||
    msg.includes('user cancelled') ||
    msg.includes('user_canceled') ||
    msg.includes('frejaid_user_canceled') ||
    msg.includes('bankid') && msg.includes('cancel')
  )
}

function stripOidcErrorParamsFromUrl() {
  const url = new URL(window.location.href)
  let changed = false
  for (const key of ['error', 'error_description', 'state', 'session_state', 'iss']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  }
  // Idura may also return errors in the hash (implicit / hybrid).
  if (url.hash.includes('error=')) {
    url.hash = ''
    changed = true
  }
  if (changed) {
    const next = url.pathname + (url.search || '')
    window.history.replaceState({}, document.title, next)
  }
}

async function clearOidcErrorAndReload(
  removeUser: () => Promise<void>
): Promise<void> {
  stripOidcErrorParamsFromUrl()
  try {
    await removeUser()
  } catch {
    // Ignore; reload will reset AuthProvider state.
  }
  window.location.assign(window.location.pathname)
}

/**
 * Minimal participant OIDC login control for Alt 2.3 PoC (oidc-simulator / Idura).
 */
export default function ParticipantOidcLogin({ s }: ParticipantOidcLoginProps) {
  const auth = useAuth()

  useEffect(() => {
    if (auth.error) {
      stripOidcErrorParamsFromUrl()
    }
  }, [auth.error])

  if (auth.isLoading) {
    return (
      <div className="oidc-login-bar" role="status">
        {s.loading}
      </div>
    )
  }

  if (auth.error) {
    const canceled = isUserCanceledOidcError(auth.error)
    return (
      <div className="oidc-login-bar" role="alert">
        <p style={{ margin: '0 0 0.75rem' }}>
          {canceled ? s.oidcLoginCanceled : s.oidcLoginFailed}
        </p>
        <button
          type="button"
          className="submit-button"
          onClick={() => {
            void clearOidcErrorAndReload(() => auth.removeUser())
          }}>
          {s.oidcTryAgain}
        </button>
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
            state: { returnTo: window.location.pathname }
          })
        }>
        {s.oidcSignIn}
      </button>
    </div>
  )
}

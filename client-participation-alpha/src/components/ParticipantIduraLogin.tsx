import { useEffect } from 'react'
import { useCriiptoVerify, AuthMethodSelector, OAuth2Error } from '@criipto/verify-react'
import '@criipto/verify-react/index.css'
import type { Translations } from '../strings/types'
import { IDURA_SE_ACR_VALUES } from '../lib/idura'
import { getIduraRedirectUri, IDURA_LOGOUT_KEY } from '../lib/iduraRedirect'

function stripOidcErrorParamsFromUrl() {
  const url = new URL(window.location.href)
  let changed = false
  for (const key of ['error', 'error_description', 'state', 'session_state', 'iss']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  }
  if (url.hash.includes('error=')) {
    url.hash = ''
    changed = true
  }
  if (changed) {
    const next = url.pathname + (url.search || '')
    window.history.replaceState({}, document.title, next)
  }
}

interface ParticipantIduraLoginProps {
  s: Translations
}

export function formatIduraError(
  error: unknown,
  s: Translations
): { title: string; detail?: string } {
  if (error instanceof OAuth2Error) {
    const code = (error.error || '').toLowerCase()
    const desc = (error.error_description || '').toLowerCase()
    if (
      code.includes('access_denied') ||
      desc.includes('cancel') ||
      desc.includes('user_canceled') ||
      desc.includes('frejaid_user_canceled')
    ) {
      return { title: s.oidcLoginCanceled }
    }
    if (
      code.includes('temporarily_unavailable') ||
      desc.includes('frejaid_http_error_upstream') ||
      desc.includes('error communicating with freja')
    ) {
      const instanceMatch = (error.error_description || '').match(
        /Error instance:\s*([0-9a-f-]{36})/i
      )
      return {
        title: s.oidcLoginFrejaUnavailable,
        detail: instanceMatch ? `Idura error instance: ${instanceMatch[1]}` : undefined
      }
    }
    const detail = [error.error, error.error_description].filter(Boolean).join(' · ')
    return { title: s.oidcLoginFailed, detail: detail || undefined }
  }
  return { title: s.oidcLoginFailed, detail: String(error) }
}

function isMissingIduraSession(error: unknown): boolean {
  return error instanceof OAuth2Error && error.error === 'login_required'
}

/**
 * Idura Verify login UI (BankID / Freja via AuthMethodSelector).
 */
export default function ParticipantIduraLogin({ s }: ParticipantIduraLoginProps) {
  const { claims, error, isLoading, isInitializing, logout } = useCriiptoVerify()

  useEffect(() => {
    if (error && !isMissingIduraSession(error)) {
      stripOidcErrorParamsFromUrl()
    }
  }, [error])

  if (isLoading || isInitializing) {
    return (
      <div className="oidc-login-bar" role="status">
        {s.loading}
      </div>
    )
  }

  if (error && !isMissingIduraSession(error)) {
    const formatted = formatIduraError(error, s)
    return (
      <div className="oidc-login-bar" role="alert">
        <p style={{ margin: '0 0 0.5rem' }}>{formatted.title}</p>
        {formatted.detail ? (
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>{formatted.detail}</p>
        ) : null}
        <button
          type="button"
          className="submit-button"
          onClick={() => {
            window.history.replaceState({}, document.title, window.location.pathname)
            window.location.assign(window.location.pathname)
          }}
        >
          {s.oidcTryAgain}
        </button>
      </div>
    )
  }

  if (claims) {
    const label =
      (claims as { email?: string; name?: string; sub?: string }).email ||
      (claims as { name?: string }).name ||
      'eID'
    return (
      <div className="oidc-login-bar">
        <span>{s.oidcSignedInAs.replace('{{email}}', String(label))}</span>
        <button
          type="button"
          className="submit-button"
          onClick={() => {
            window.sessionStorage.setItem(IDURA_LOGOUT_KEY, 'true')
            void logout({ redirectUri: getIduraRedirectUri() })
          }}
        >
          {s.oidcSignOut}
        </button>
      </div>
    )
  }

  return (
    <div className="oidc-login-bar idura-login-bar">
      <p style={{ margin: '0 0 0.75rem', fontWeight: 600 }}>{s.oidcSignIn}</p>
      <AuthMethodSelector acrValues={[...IDURA_SE_ACR_VALUES]} />
    </div>
  )
}

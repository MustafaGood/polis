import { useEffect, useMemo } from 'react'
import { useCriiptoVerify } from '@criipto/verify-react'
import type { Translations } from '../strings/types'
import { formatIduraError } from './ParticipantIduraLogin'
import {
  IDURA_LOGOUT_KEY,
  IDURA_RETURN_TO_KEY,
  resolveIduraReturnTo
} from '../lib/iduraRedirect'

interface IduraCallbackProps {
  s: Translations
}

export default function IduraCallback({ s }: IduraCallbackProps) {
  const { claims, error, isLoading, isInitializing } = useCriiptoVerify()
  const returnTo = useMemo(
    () => resolveIduraReturnTo(window.sessionStorage.getItem(IDURA_RETURN_TO_KEY)),
    []
  )

  useEffect(() => {
    if (isLoading || isInitializing) {
      return
    }

    const isLoggingOut = window.sessionStorage.getItem(IDURA_LOGOUT_KEY) === 'true'
    if (claims || isLoggingOut) {
      window.sessionStorage.removeItem(IDURA_RETURN_TO_KEY)
      window.sessionStorage.removeItem(IDURA_LOGOUT_KEY)
      window.location.replace(returnTo)
    }
  }, [claims, isInitializing, isLoading, returnTo])

  const returnToPolis = () => {
    window.sessionStorage.removeItem(IDURA_RETURN_TO_KEY)
    window.sessionStorage.removeItem(IDURA_LOGOUT_KEY)
    window.location.replace(returnTo)
  }

  if (isLoading || isInitializing) {
    return (
      <div className="oidc-login-bar" role="status">
        {s.loading}
      </div>
    )
  }

  if (error) {
    const formatted = formatIduraError(error, s)
    return (
      <div className="oidc-login-bar" role="alert">
        <p style={{ margin: '0 0 0.5rem' }}>{formatted.title}</p>
        {formatted.detail ? (
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
            {formatted.detail}
          </p>
        ) : null}
        <button type="button" className="submit-button" onClick={returnToPolis}>
          {s.oidcTryAgain}
        </button>
      </div>
    )
  }

  return (
    <div className="oidc-login-bar" role="status">
      <p>{s.oidcLoginFailed}</p>
      <button type="button" className="submit-button" onClick={returnToPolis}>
        {s.oidcTryAgain}
      </button>
    </div>
  )
}

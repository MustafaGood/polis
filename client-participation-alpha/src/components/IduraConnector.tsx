import { useEffect, useRef } from 'react'
import { useCriiptoVerify } from '@criipto/verify-react'
import { setOidcActions, setOidcTokenGetter } from '../lib/net'
import {
  getIduraReturnTo,
  IDURA_RETURN_TO_KEY
} from '../lib/iduraRedirect'

/**
 * Wires Idura/Criipto session into PolisNet (parallel to OidcConnector).
 */
export default function IduraConnector() {
  const { claims, result, loginWithRedirect, logout, isLoading } = useCriiptoVerify()
  const authWasReady = useRef(false)

  useEffect(() => {
    window.sessionStorage.setItem(IDURA_RETURN_TO_KEY, getIduraReturnTo())
  }, [])

  useEffect(() => {
    setOidcActions({
      signinRedirect: () => {
        void loginWithRedirect()
      }
    })

    const idToken =
      (typeof result === 'object' && result && 'id_token' in result
        ? (result as { id_token?: string }).id_token
        : undefined) || undefined

    if (claims && !isLoading) {
      const tokenGetter = async () => idToken ?? null
      setOidcTokenGetter(tokenGetter)

      if (!authWasReady.current) {
        authWasReady.current = true
        window.dispatchEvent(new Event('polisAuthReady'))
      }
    } else if (!claims && !isLoading) {
      setOidcTokenGetter(null)
      authWasReady.current = false
    }

    return () => {
      setOidcActions(null)
    }
  }, [claims, result, isLoading, loginWithRedirect, logout])

  return null
}

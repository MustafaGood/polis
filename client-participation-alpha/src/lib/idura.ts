/**
 * Helpers for Idura Verify (Criipto) vs generic OIDC simulator.
 */

export function isOidcLoginEnabled(): boolean {
  const flag = import.meta.env.PUBLIC_ENABLE_OIDC_LOGIN
  return flag === 'true' || flag === '1'
}

/** True when PUBLIC_AUTH_ISSUER points at Idura/Criipto broker. */
export function isIduraIssuer(issuer?: string): boolean {
  const value = issuer ?? import.meta.env.PUBLIC_AUTH_ISSUER ?? ''
  return /idura\.broker|criipto\.(com|io)/i.test(value)
}

/** CriiptoVerifyProvider expects hostname, not https:// URL. */
export function getIduraDomain(issuer?: string): string | null {
  const value = issuer ?? import.meta.env.PUBLIC_AUTH_ISSUER
  if (!value) return null
  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return new URL(value).host
    }
    return value.replace(/\/$/, '')
  } catch {
    return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

export function getParticipantRedirectUri(): string {
  return `${window.location.origin}${window.location.pathname}`
}

/**
 * Distinct Swedish eID methods for AuthMethodSelector.
 * Do not include generic `urn:grn:authn:se:bankid` together with another-device:qr / :same-device
 * (that duplicates the "Login with BankID" button).
 * This tenant rejects the short `:qr` value; the supported QR acr is `another-device:qr`.
 */
export const IDURA_SE_ACR_VALUES = [
  'urn:grn:authn:se:bankid:another-device:qr',
  'urn:grn:authn:se:bankid:same-device',
  'urn:grn:authn:se:frejaid'
] as const

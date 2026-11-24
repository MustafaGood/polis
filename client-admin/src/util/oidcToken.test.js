import { getOidcApiToken } from './oidcToken'
import { decodedJwt } from './auth'

describe('getOidcApiToken', () => {
  it('uses the Idura ID token for Polis API requests', () => {
    expect(
      getOidcApiToken(
        { access_token: 'opaque-access-token', id_token: 'signed-id-token' },
        'https://example.test.idura.broker'
      )
    ).toBe('signed-id-token')
  })

  it('keeps using the access token for other OIDC issuers', () => {
    expect(
      getOidcApiToken(
        { access_token: 'api-access-token', id_token: 'id-token' },
        'https://example.auth0.com/'
      )
    ).toBe('api-access-token')
  })

  it('does not send an opaque Idura access token when no ID token is available', () => {
    expect(
      getOidcApiToken(
        { access_token: 'opaque-access-token' },
        'https://example.test.idura.broker'
      )
    ).toBeNull()
  })

  it('decodes Idura claims from the ID token instead of the opaque access token', () => {
    const originalIssuer = process.env.AUTH_ISSUER
    process.env.AUTH_ISSUER = 'https://example.test.idura.broker'
    const payload = { sub: 'test-user' }
    const idToken = `header.${btoa(JSON.stringify(payload))}.signature`

    try {
      expect(
        decodedJwt({ access_token: 'opaque-access-token', id_token: idToken })
      ).toEqual(payload)
    } finally {
      if (originalIssuer === undefined) {
        delete process.env.AUTH_ISSUER
      } else {
        process.env.AUTH_ISSUER = originalIssuer
      }
    }
  })
})

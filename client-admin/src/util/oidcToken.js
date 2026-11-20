export const getOidcApiToken = (user, issuer) => {
  const hostname =
    typeof issuer === 'string' ? new URL(issuer).hostname.toLowerCase() : ''
  const isIduraIssuer =
    hostname === 'idura.broker' || hostname.endsWith('.idura.broker')

  return isIduraIssuer ? user?.id_token ?? null : user?.access_token ?? null
}

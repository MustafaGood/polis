type TokenGetter = () => Promise<string | null | undefined>

export async function fetchWithEidFallback(
  url: string,
  options: RequestInit & { headers: Record<string, string> },
  getOidcToken?: TokenGetter
): Promise<Response> {
  const response = await fetch(url, options)
  if (response.status !== 403 || !getOidcToken) {
    return response
  }

  let error: unknown
  try {
    error = await response.clone().json()
  } catch (error) {
    if (error instanceof SyntaxError) {
      return response
    }
    throw error
  }

  if (
    typeof error !== 'object' ||
    error === null ||
    !('error' in error) ||
    error.error !== 'polis_err_eid_required'
  ) {
    return response
  }

  const oidcToken = await getOidcToken()
  if (!oidcToken) {
    return response
  }

  return fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${oidcToken}` }
  })
}

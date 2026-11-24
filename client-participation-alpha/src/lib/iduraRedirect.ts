export const IDURA_CALLBACK_PATH = '/auth/idura/callback'
export const IDURA_RETURN_TO_KEY = 'polis.idura.returnTo'
export const IDURA_LOGOUT_KEY = 'polis.idura.logout'

type ReturnLocation = Pick<Location, 'pathname' | 'search' | 'hash'>

function isCallbackPath(pathname: string): boolean {
  return pathname.replace(/\/$/, '') === IDURA_CALLBACK_PATH
}

export function getIduraRedirectUri(origin = window.location.origin): string {
  return `${origin}${IDURA_CALLBACK_PATH}`
}

export function getIduraReturnTo(location: ReturnLocation = window.location): string {
  if (isCallbackPath(location.pathname)) {
    return '/'
  }
  return `${location.pathname}${location.search}${location.hash}`
}

export function resolveIduraReturnTo(
  returnTo: string | null,
  origin = window.location.origin
): string {
  if (!returnTo) {
    return '/'
  }

  try {
    const url = new URL(returnTo, origin)
    if (url.origin !== origin || isCallbackPath(url.pathname)) {
      return '/'
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/'
  }
}

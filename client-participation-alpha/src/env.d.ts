/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SERVICE_URL: string
  readonly PUBLIC_OIDC_CACHE_KEY_PREFIX: string
  readonly PUBLIC_OIDC_CACHE_KEY_ID_TOKEN_SUFFIX: string
  readonly INTERNAL_SERVICE_URL: string
  readonly PUBLIC_AUTH_NAMESPACE?: string
  readonly PUBLIC_AUTH_ISSUER?: string
  readonly PUBLIC_AUTH_CLIENT_ID?: string
  readonly PUBLIC_AUTH_AUDIENCE?: string
  /** Set to "true" to show participant OIDC login (Alt 2.3 PoC). */
  readonly PUBLIC_ENABLE_OIDC_LOGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

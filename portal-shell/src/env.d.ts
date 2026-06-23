/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string
  readonly PUBLIC_OIDC_AUTHORITY: string
  readonly PUBLIC_OIDC_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

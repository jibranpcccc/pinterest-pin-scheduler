/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PINTEREST_CLIENT_ID: string
  readonly VITE_PINTEREST_REDIRECT_URI: string
  readonly VITE_PINTEREST_API_URL: string
  readonly VITE_PINTEREST_SCOPE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

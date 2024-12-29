/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Remove BASE_URL as it's already defined in vite/client
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

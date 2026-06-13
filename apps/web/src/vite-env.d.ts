/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WEB_BASE_URL?: string;
  readonly VITE_FILE_SERVICE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// @fontsource packages are CSS side-effect modules with no type declarations.
declare module '@fontsource/*';

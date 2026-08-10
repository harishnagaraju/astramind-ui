/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMFYUI_BASE_URL: string;
  readonly VITE_COMFYUI_CHECKPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

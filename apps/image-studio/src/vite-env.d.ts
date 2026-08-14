/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMFYUI_BASE_URL: string;
  readonly VITE_COMFYUI_CHECKPOINT?: string;
  readonly VITE_COMFYUI_MODEL_FAMILY?: string;
  readonly VITE_COMFYUI_FLUX_UNET?: string;
  readonly VITE_COMFYUI_FLUX_CLIP_L?: string;
  readonly VITE_COMFYUI_FLUX_CLIP_T5?: string;
  readonly VITE_COMFYUI_FLUX_VAE?: string;
  readonly VITE_COMFYUI_FLUX_GUIDANCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

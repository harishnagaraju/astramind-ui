console.log("DEBUG env check ->", import.meta.env.VITE_COMFYUI_BASE_URL);
console.log("DEBUG env check ->", import.meta.env.VITE_COMFYUI_BASE_URL);
import { createComfyUiConnector } from '@astramind/comfyui-connector';
import type { ImageGenerationConnector } from '@astramind/shared';

let cachedConnector: ImageGenerationConnector | null = null;

/**
 * The connector always talks to the relative "/comfyui-api" path, which the
 * Vite dev server proxies to VITE_COMFYUI_BASE_URL (see vite.config.ts). We
 * still read the env var here purely to fail fast with a clear message if
 * it hasn't been configured.
 */
export function getComfyUiConnector(): ImageGenerationConnector {
  if (cachedConnector !== null) {
    return cachedConnector;
  }

  const baseUrl = import.meta.env.VITE_COMFYUI_BASE_URL;

  if (baseUrl === undefined || baseUrl.length === 0) {
    throw new Error(
      'VITE_COMFYUI_BASE_URL is not set. Copy .env.example to .env and point it at your Jarvislabs ComfyUI URL, then restart pnpm dev.',
    );
  }

  cachedConnector = createComfyUiConnector({
    baseUrl: '/comfyui-api',
    checkpointName: import.meta.env.VITE_COMFYUI_CHECKPOINT,
  });

  return cachedConnector;
}

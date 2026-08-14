import { createComfyUiConnector, type ComfyUiConnectorConfig } from '@astramind/comfyui-connector';
import type { ImageGenerationConnector } from '@astramind/shared';

let cachedConnector: ImageGenerationConnector | null = null;

/**
 * Only includes keys the user actually set. Spreading an object with
 * explicit `undefined` values would otherwise clobber the connector's
 * defaults during its own merge step.
 */
function buildFluxKontextOverrides(): ComfyUiConnectorConfig['fluxKontext'] {
  const overrides: NonNullable<ComfyUiConnectorConfig['fluxKontext']> = {};

  if (import.meta.env.VITE_COMFYUI_FLUX_UNET !== undefined) {
    overrides.unetName = import.meta.env.VITE_COMFYUI_FLUX_UNET;
  }

  if (import.meta.env.VITE_COMFYUI_FLUX_CLIP_L !== undefined) {
    overrides.clipName1 = import.meta.env.VITE_COMFYUI_FLUX_CLIP_L;
  }

  if (import.meta.env.VITE_COMFYUI_FLUX_CLIP_T5 !== undefined) {
    overrides.clipName2 = import.meta.env.VITE_COMFYUI_FLUX_CLIP_T5;
  }

  if (import.meta.env.VITE_COMFYUI_FLUX_VAE !== undefined) {
    overrides.vaeName = import.meta.env.VITE_COMFYUI_FLUX_VAE;
  }

  if (import.meta.env.VITE_COMFYUI_FLUX_GUIDANCE !== undefined) {
    overrides.guidance = Number(import.meta.env.VITE_COMFYUI_FLUX_GUIDANCE);
  }

  return overrides;
}

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

  const modelFamily = import.meta.env.VITE_COMFYUI_MODEL_FAMILY === 'flux-kontext' ? 'flux-kontext' : 'stable-diffusion';

  cachedConnector = createComfyUiConnector({
    baseUrl: '/comfyui-api',
    modelFamily,
    checkpointName: import.meta.env.VITE_COMFYUI_CHECKPOINT,
    fluxKontext: buildFluxKontextOverrides(),
  });

  return cachedConnector;
}

export interface ComfyUiConnectorConfig {
  /** Origin the connector talks to (typically the Vite dev proxy path, e.g. "/comfyui-api"). */
  baseUrl: string;
  /** Which workflow graph to build. Defaults to "stable-diffusion". */
  modelFamily?: 'stable-diffusion' | 'flux-kontext';

  // --- stable-diffusion family ---
  /** Pin a checkpoint filename. If omitted, the first checkpoint ComfyUI reports is used. */
  checkpointName?: string;
  negativePrompt?: string;
  cfgScale?: number;
  /** 0-1. How much the sampler is allowed to diverge from the input image. */
  denoise?: number;

  // --- shared sampler settings ---
  steps?: number;
  samplerName?: string;
  scheduler?: string;

  // --- flux-kontext family ---
  fluxKontext?: Partial<FluxKontextSettings>;
}

export interface FluxKontextSettings {
  unetName: string;
  clipName1: string;
  clipName2: string;
  vaeName: string;
  /** FluxGuidance value (distilled guidance scale). Typical range 1-4. */
  guidance: number;
}

export const DEFAULT_COMFYUI_GENERATION_SETTINGS = {
  negativePrompt: 'blurry, distorted, 3d render, cartoon, anime, drawing, bad anatomy, low quality',
  steps: 25,
  cfgScale: 6.0,
  denoise: 0.55,
  samplerName: 'dpmpp_2m',
  scheduler: 'karras',
} as const;

/**
 * Defaults reflect the FLUX.1 Kontext dev (fp8 scaled) files confirmed present
 * on the connected ComfyUI instance via /object_info. Override any of these
 * through config.fluxKontext if your instance uses different filenames.
 */
export const DEFAULT_FLUX_KONTEXT_SETTINGS: FluxKontextSettings = {
  unetName: 'flux1-dev-abliterated.safetensors',
  clipName1: 'clip_l.safetensors',
  clipName2: 't5xxl_fp16.safetensors',
  vaeName: 'ae.safetensors',
  guidance: 2.5,
};

export const DEFAULT_FLUX_KONTEXT_SAMPLER_SETTINGS = {
  steps: 20,
  cfgScale: 1.0,
  samplerName: 'euler',
  scheduler: 'simple',
} as const;

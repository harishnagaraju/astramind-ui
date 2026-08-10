export interface ComfyUiConnectorConfig {
  /** Origin the connector talks to (typically the Vite dev proxy path, e.g. "/comfyui-api"). */
  baseUrl: string;
  /** Pin a checkpoint filename. If omitted, the first checkpoint ComfyUI reports is used. */
  checkpointName?: string;
  negativePrompt?: string;
  steps?: number;
  cfgScale?: number;
  /** 0-1. How much the sampler is allowed to diverge from the input image. */
  denoise?: number;
  samplerName?: string;
  scheduler?: string;
}

export const DEFAULT_COMFYUI_GENERATION_SETTINGS = {
  negativePrompt: '',
  steps: 20,
  cfgScale: 7,
  denoise: 0.65,
  samplerName: 'euler',
  scheduler: 'normal',
} as const;

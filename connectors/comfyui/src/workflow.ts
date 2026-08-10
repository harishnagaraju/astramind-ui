export interface BuildWorkflowParams {
  checkpointName: string;
  uploadedImageName: string;
  positivePrompt: string;
  negativePrompt: string;
  steps: number;
  cfgScale: number;
  denoise: number;
  samplerName: string;
  scheduler: string;
  seed: number;
}

export type ComfyUiPromptGraph = Record<string, { class_type: string; inputs: Record<string, unknown> }>;

/**
 * Minimal image-to-image graph:
 * checkpoint -> (positive/negative CLIP encode) + (load image -> VAE encode)
 *            -> KSampler -> VAE decode -> save image
 */
export function buildImageToImageWorkflow(params: BuildWorkflowParams): ComfyUiPromptGraph {
  return {
    '1': {
      class_type: 'CheckpointLoaderSimple',
      inputs: { ckpt_name: params.checkpointName },
    },
    '2': {
      class_type: 'CLIPTextEncode',
      inputs: { text: params.positivePrompt, clip: ['1', 1] },
    },
    '3': {
      class_type: 'CLIPTextEncode',
      inputs: { text: params.negativePrompt, clip: ['1', 1] },
    },
    '4': {
      class_type: 'LoadImage',
      inputs: { image: params.uploadedImageName },
    },
    '5': {
      class_type: 'VAEEncode',
      inputs: { pixels: ['4', 0], vae: ['1', 2] },
    },
    '6': {
      class_type: 'KSampler',
      inputs: {
        seed: params.seed,
        steps: params.steps,
        cfg: params.cfgScale,
        sampler_name: params.samplerName,
        scheduler: params.scheduler,
        denoise: params.denoise,
        model: ['1', 0],
        positive: ['2', 0],
        negative: ['3', 0],
        latent_image: ['5', 0],
      },
    },
    '7': {
      class_type: 'VAEDecode',
      inputs: { samples: ['6', 0], vae: ['1', 2] },
    },
    '8': {
      class_type: 'SaveImage',
      inputs: { images: ['7', 0], filename_prefix: 'astramind' },
    },
  };
}

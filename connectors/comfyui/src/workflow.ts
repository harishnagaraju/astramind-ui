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

export interface BuildFluxKontextWorkflowParams {
  unetName: string;
  clipName1: string;
  clipName2: string;
  vaeName: string;
  uploadedImageName: string;
  positivePrompt: string;
  guidance: number;
  steps: number;
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

/**
 * FLUX.1 Kontext image-editing graph. Unlike SD img2img, Kontext doesn't
 * blend noise into the source image — it injects the reference image as
 * conditioning (via ReferenceLatent) and denoises from scratch (denoise=1).
 * This mirrors the official Comfy Org FLUX Kontext template graph.
 */
export function buildFluxKontextWorkflow(params: BuildFluxKontextWorkflowParams): ComfyUiPromptGraph {
  return {
    '1': {
      class_type: 'UNETLoader',
      inputs: { unet_name: params.unetName, weight_dtype: 'default' },
    },
    '2': {
      class_type: 'DualCLIPLoader',
      inputs: {
        clip_name1: params.clipName1,
        clip_name2: params.clipName2,
        type: 'flux',
      },
    },
    '3': {
      class_type: 'VAELoader',
      inputs: { vae_name: params.vaeName },
    },
    '4': {
      class_type: 'LoadImage',
      inputs: { image: params.uploadedImageName },
    },
    '5': {
      class_type: 'FluxKontextImageScale',
      inputs: { image: ['4', 0] },
    },
    '6': {
      class_type: 'VAEEncode',
      inputs: { pixels: ['5', 0], vae: ['3', 0] },
    },
    '7': {
      class_type: 'CLIPTextEncode',
      inputs: { text: params.positivePrompt, clip: ['2', 0] },
    },
    '8': {
      class_type: 'FluxGuidance',
      inputs: { conditioning: ['7', 0], guidance: params.guidance },
    },
    '9': {
      // Injects the reference-image latent into the conditioning stream.
      class_type: 'ReferenceLatent',
      inputs: { conditioning: ['8', 0], latent: ['6', 0] },
    },
    '10': {
      // FLUX doesn't use a hand-written negative prompt; a zeroed-out
      // conditioning is the standard placeholder KSampler still requires.
      class_type: 'ConditioningZeroOut',
      inputs: { conditioning: ['7', 0] },
    },
    '11': {
      class_type: 'KSampler',
      inputs: {
        seed: params.seed,
        steps: params.steps,
        // FLUX's guidance is embedded via FluxGuidance above; cfg stays at 1.
        cfg: 1,
        sampler_name: params.samplerName,
        scheduler: params.scheduler,
        // denoise=1: this is a from-scratch generation conditioned on the
        // reference latent, not a partial-noise img2img blend.
        denoise: 1,
        model: ['1', 0],
        positive: ['9', 0],
        negative: ['10', 0],
        // Reusing the reference latent purely for its shape/batch info —
        // denoise=1 means KSampler discards its content and starts from
        // full noise, so no separate EmptyLatentImage node is needed.
        latent_image: ['6', 0],
      },
    },
    '12': {
      class_type: 'VAEDecode',
      inputs: { samples: ['11', 0], vae: ['3', 0] },
    },
    '13': {
      class_type: 'SaveImage',
      inputs: { images: ['12', 0], filename_prefix: 'astramind-kontext' },
    },
  };
}

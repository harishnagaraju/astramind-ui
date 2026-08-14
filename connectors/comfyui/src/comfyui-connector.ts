import type {
  GeneratedImageResult,
  GenerationProgress,
  ImageGenerationConnector,
  ImageGenerationRequest,
} from '@astramind/shared';

import { fetchAvailableCheckpoints } from './checkpoints';
import {
  DEFAULT_COMFYUI_GENERATION_SETTINGS,
  DEFAULT_FLUX_KONTEXT_SAMPLER_SETTINGS,
  DEFAULT_FLUX_KONTEXT_SETTINGS,
  type ComfyUiConnectorConfig,
} from './config';
import { watchComfyUiExecution } from './progress-socket';
import type { ComfyUiQueuePromptResponse } from './types';
import { uploadInputImage } from './upload';
import { buildFluxKontextWorkflow, buildImageToImageWorkflow, type ComfyUiPromptGraph } from './workflow';

export class ComfyUiConnector implements ImageGenerationConnector {
  readonly providerName = 'ComfyUI';

  private readonly config: ComfyUiConnectorConfig;
  private resolvedCheckpointName: string | null;

  constructor(config: ComfyUiConnectorConfig) {
    this.config = config;
    this.resolvedCheckpointName = config.checkpointName ?? null;
  }

  async generate(
    request: ImageGenerationRequest,
    onProgress: (progress: GenerationProgress) => void,
  ): Promise<GeneratedImageResult> {
    const { baseUrl } = this.config;

    onProgress({ percent: 0, message: 'Uploading image to ComfyUI…' });
    const uploaded = await uploadInputImage(baseUrl, request.inputImageFile);

    const seed = Math.floor(Math.random() * 1_000_000_000);
    const isFluxKontext = this.config.modelFamily === 'flux-kontext';

    let workflow: ComfyUiPromptGraph;
    let progressLabel: string;

    if (isFluxKontext) {
      const overrides = this.config.fluxKontext ?? {};
      const settings = {
        unetName: overrides.unetName ?? DEFAULT_FLUX_KONTEXT_SETTINGS.unetName,
        clipName1: overrides.clipName1 ?? DEFAULT_FLUX_KONTEXT_SETTINGS.clipName1,
        clipName2: overrides.clipName2 ?? DEFAULT_FLUX_KONTEXT_SETTINGS.clipName2,
        vaeName: overrides.vaeName ?? DEFAULT_FLUX_KONTEXT_SETTINGS.vaeName,
        guidance: overrides.guidance ?? DEFAULT_FLUX_KONTEXT_SETTINGS.guidance,
      };

      workflow = buildFluxKontextWorkflow({
        unetName: settings.unetName,
        clipName1: settings.clipName1,
        clipName2: settings.clipName2,
        vaeName: settings.vaeName,
        uploadedImageName: uploaded.name,
        positivePrompt: request.prompt,
        guidance: settings.guidance,
        steps: this.config.steps ?? DEFAULT_FLUX_KONTEXT_SAMPLER_SETTINGS.steps,
        samplerName: this.config.samplerName ?? DEFAULT_FLUX_KONTEXT_SAMPLER_SETTINGS.samplerName,
        scheduler: this.config.scheduler ?? DEFAULT_FLUX_KONTEXT_SAMPLER_SETTINGS.scheduler,
        seed,
      });
      progressLabel = `Queuing prompt on ${settings.unetName}…`;
    } else {
      const checkpointName = await this.resolveCheckpointName();

      workflow = buildImageToImageWorkflow({
        checkpointName,
        uploadedImageName: uploaded.name,
        positivePrompt: request.prompt,
        negativePrompt: this.config.negativePrompt ?? DEFAULT_COMFYUI_GENERATION_SETTINGS.negativePrompt,
        steps: this.config.steps ?? DEFAULT_COMFYUI_GENERATION_SETTINGS.steps,
        cfgScale: this.config.cfgScale ?? DEFAULT_COMFYUI_GENERATION_SETTINGS.cfgScale,
        denoise: this.config.denoise ?? DEFAULT_COMFYUI_GENERATION_SETTINGS.denoise,
        samplerName: this.config.samplerName ?? DEFAULT_COMFYUI_GENERATION_SETTINGS.samplerName,
        scheduler: this.config.scheduler ?? DEFAULT_COMFYUI_GENERATION_SETTINGS.scheduler,
        seed,
      });
      progressLabel = `Queuing prompt on ${checkpointName}…`;
    }

    onProgress({ percent: 5, message: progressLabel });

    const clientId = crypto.randomUUID();

    const response = await fetch(`${baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow, client_id: clientId }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`ComfyUI rejected the prompt (${response.status.toString()}): ${errorBody}`);
    }

    const queued = (await response.json()) as ComfyUiQueuePromptResponse;

    return new Promise<GeneratedImageResult>((resolve, reject) => {
      const stopWatching = watchComfyUiExecution(baseUrl, clientId, queued.prompt_id, {
        onProgress: (percent) => {
          onProgress({ percent: Math.min(99, Math.max(5, percent)), message: 'Generating…' });
        },
        onCompleted: (images) => {
          stopWatching();
          const output = images[0];

          if (output === undefined) {
            reject(new Error('ComfyUI finished without producing an image.'));
            return;
          }

          const viewUrl = new URL(`${baseUrl}/view`, window.location.origin);
          viewUrl.searchParams.set('filename', output.filename);
          viewUrl.searchParams.set('subfolder', output.subfolder);
          viewUrl.searchParams.set('type', output.type);

          resolve({ name: output.filename, previewUrl: viewUrl.toString() });
        },
        onError: (message) => {
          stopWatching();
          reject(new Error(message));
        },
      });
    });
  }

  private async resolveCheckpointName(): Promise<string> {
    if (this.resolvedCheckpointName !== null) {
      return this.resolvedCheckpointName;
    }

    const checkpoints = await fetchAvailableCheckpoints(this.config.baseUrl);
    const [first] = checkpoints;

    if (first === undefined) {
      throw new Error('No checkpoints are available on the connected ComfyUI instance.');
    }

    this.resolvedCheckpointName = first;
    return first;
  }
}

export function createComfyUiConnector(config: ComfyUiConnectorConfig): ComfyUiConnector {
  return new ComfyUiConnector(config);
}

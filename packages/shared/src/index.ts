export interface GenerationProgress {
  message: string;
  percent: number;
}

export interface GeneratedImageResult {
  name: string;
  previewUrl: string;
}

export interface ImageGenerationRequest {
  inputImageFile: File;
  prompt: string;
}

/**
 * Every image-generation backend (ComfyUI, Automatic1111, future providers)
 * implements this interface. The UI only ever depends on this contract, never
 * on a specific provider's API shape.
 */
export interface ImageGenerationConnector {
  readonly providerName: string;
  generate(
    request: ImageGenerationRequest,
    onProgress: (progress: GenerationProgress) => void,
  ): Promise<GeneratedImageResult>;
}

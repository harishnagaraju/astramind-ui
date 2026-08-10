import type { ComfyUiUploadResponse } from './types';

export async function uploadInputImage(baseUrl: string, file: File): Promise<ComfyUiUploadResponse> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('overwrite', 'true');

  const response = await fetch(`${baseUrl}/upload/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ComfyUI rejected the image upload (${response.status.toString()}).`);
  }

  return (await response.json()) as ComfyUiUploadResponse;
}

import type { ComfyUiObjectInfoCheckpointLoader } from './types';

export async function fetchAvailableCheckpoints(baseUrl: string): Promise<string[]> {
  const response = await fetch(`${baseUrl}/object_info/CheckpointLoaderSimple`);

  if (!response.ok) {
    throw new Error(`Failed to load the checkpoint list from ComfyUI (${response.status.toString()}).`);
  }

  const payload = (await response.json()) as ComfyUiObjectInfoCheckpointLoader;
  const names = payload.CheckpointLoaderSimple?.input.required.ckpt_name[0];

  return names ?? [];
}

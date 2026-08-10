import type { InputImage } from './image-studio-store';

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type PrepareImageInputResult =
  | { ok: true; value: InputImage }
  | { ok: false; error: string };

export function prepareImageInput(file: File): PrepareImageInputResult {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return {
      ok: false,
      error: 'Choose a PNG, JPEG, or WebP image.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      ok: false,
      error: 'Choose an image smaller than 20 MB.',
    };
  }

  return {
    ok: true,
    value: {
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
    },
  };
}

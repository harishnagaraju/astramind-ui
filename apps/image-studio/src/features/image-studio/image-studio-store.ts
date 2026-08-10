import { create } from 'zustand';

export interface InputImage {
  file: File;
  name: string;
  previewUrl: string;
}

export type StudioStatus =
  | { kind: 'ready'; message: string }
  | { kind: 'uploading'; message: string }
  | { kind: 'generating'; message: string; progress: number }
  | { kind: 'downloading'; message: string }
  | { kind: 'completed'; message: string }
  | { kind: 'error'; message: string };

interface ImageStudioState {
  inputImage: InputImage | null;
  prompt: string;
  status: StudioStatus;
  setInputImage: (image: InputImage) => void;
  clearInputImage: () => void;
  setPrompt: (prompt: string) => void;
  setStatus: (status: StudioStatus) => void;
}

export const useImageStudioStore = create<ImageStudioState>((set) => ({
  inputImage: null,
  prompt: '',
  status: { kind: 'ready', message: 'Ready' },
  setInputImage: (image) => set({ inputImage: image }),
  clearInputImage: () => set({ inputImage: null, status: { kind: 'ready', message: 'Ready' } }),
  setPrompt: (prompt) => set({ prompt }),
  setStatus: (status) => set({ status }),
}));

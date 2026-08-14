#!/bin/bash
set -e

# Ensure script is executing relative to the repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"
echo "📍 Working in repository root: $ROOT_DIR"
echo "🚀 Starting AstraMind Connector Integration..."

# -----------------------------------------------------------------------------
# PART 1: Create connectors/astramind package files
# -----------------------------------------------------------------------------
echo "📁 Creating connectors/astramind directory structure..."
mkdir -p connectors/astramind/src

echo "📄 Creating connectors/astramind/package.json..."
cat << 'FILE_EOF' > connectors/astramind/package.json
{
  "name": "@astramind/astramind-connector",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@astramind/shared": "workspace:*"
  }
}
FILE_EOF

echo "📄 Creating connectors/astramind/src/types.ts..."
cat << 'FILE_EOF' > connectors/astramind/src/types.ts
export interface AstraMindConnectorConfig {
  baseUrl: string;
}

export interface ImageToImageParams {
  imageFile: File;
  prompt: string;
  denoise?: number;
  steps?: number;
  guidanceScale?: number;
}

export interface HealthCheckResponse {
  status: string;
  gpu: string;
}
FILE_EOF

echo "📄 Creating connectors/astramind/src/config.ts..."
cat << 'FILE_EOF' > connectors/astramind/src/config.ts
import { AstraMindConnectorConfig } from './types';

export const DEFAULT_ASTRAMIND_CONFIG: AstraMindConnectorConfig = {
  baseUrl: 'http://localhost:8000',
};

export const DEFAULT_GENERATION_SETTINGS = {
  denoise: 0.55,
  steps: 25,
  guidanceScale: 7.5,
} as const;
FILE_EOF

echo "📄 Creating connectors/astramind/src/astramind-connector.ts..."
cat << 'FILE_EOF' > connectors/astramind/src/astramind-connector.ts
import { AstraMindConnectorConfig, ImageToImageParams, HealthCheckResponse } from './types';
import { DEFAULT_ASTRAMIND_CONFIG, DEFAULT_GENERATION_SETTINGS } from './config';

export class AstraMindConnector {
  private baseUrl: string;

  constructor(config?: Partial<AstraMindConnectorConfig>) {
    this.baseUrl = config?.baseUrl || DEFAULT_ASTRAMIND_CONFIG.baseUrl;
  }

  async checkHealth(): Promise<HealthCheckResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`AstraMind backend unreachable at ${this.baseUrl}`);
    }
    return response.json();
  }

  async generateImg2Img(params: ImageToImageParams): Promise<string> {
    const formData = new FormData();
    formData.append('file', params.imageFile);
    formData.append('prompt', params.prompt);
    formData.append('denoise', (params.denoise ?? DEFAULT_GENERATION_SETTINGS.denoise).toString());
    formData.append('steps', (params.steps ?? DEFAULT_GENERATION_SETTINGS.steps).toString());
    formData.append('guidance_scale', (params.guidanceScale ?? DEFAULT_GENERATION_SETTINGS.guidanceScale).toString());

    const response = await fetch(`${this.baseUrl}/api/img2img`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown server error' }));
      throw new Error(errorData.detail || `AstraMind Engine request failed with status ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
FILE_EOF

echo "📄 Creating connectors/astramind/src/index.ts..."
cat << 'FILE_EOF' > connectors/astramind/src/index.ts
export * from './astramind-connector';
export * from './types';
export * from './config';
FILE_EOF

# -----------------------------------------------------------------------------
# PART 2: Integrate into apps/image-studio
# -----------------------------------------------------------------------------
echo "📄 Creating apps/image-studio/src/features/image-studio/connector-client.ts..."
cat << 'FILE_EOF' > apps/image-studio/src/features/image-studio/connector-client.ts
import { AstraMindConnector } from '@astramind/astramind-connector';
import { ComfyUIConnector } from '@astramind/comfyui-connector';

export interface GenerateImagePayload {
  imageFile: File;
  prompt: string;
  denoise?: number;
  steps?: number;
  guidanceScale?: number;
}

export interface ImageConnectorClient {
  generateImage(payload: GenerateImagePayload): Promise<string>;
}

class AstraMindConnectorAdapter implements ImageConnectorClient {
  private client: AstraMindConnector;

  constructor(baseUrl: string) {
    this.client = new AstraMindConnector({ baseUrl });
  }

  async generateImage(payload: GenerateImagePayload): Promise<string> {
    return this.client.generateImg2Img({
      imageFile: payload.imageFile,
      prompt: payload.prompt,
      denoise: payload.denoise,
      steps: payload.steps,
      guidanceScale: payload.guidanceScale,
    });
  }
}

class ComfyUIConnectorAdapter implements ImageConnectorClient {
  private client: ComfyUIConnector;

  constructor(baseUrl: string) {
    this.client = new ComfyUIConnector({ baseUrl });
  }

  async generateImage(payload: GenerateImagePayload): Promise<string> {
    return this.client.generateImg2Img(payload);
  }
}

export function createConnectorClient(): ImageConnectorClient {
  const provider = import.meta.env.VITE_AI_PROVIDER || 'astramind';

  if (provider === 'astramind') {
    const baseUrl = import.meta.env.VITE_ASTRAMIND_BASE_URL || 'http://localhost:8000';
    return new AstraMindConnectorAdapter(baseUrl);
  } else if (provider === 'comfyui') {
    const baseUrl = import.meta.env.VITE_COMFYUI_BASE_URL || 'http://localhost:8188';
    return new ComfyUIConnectorAdapter(baseUrl);
  }

  throw new Error(`Unsupported AI provider configuration: ${provider}`);
}

export const connectorClient = createConnectorClient();
FILE_EOF

echo "📄 Updating apps/image-studio/src/features/image-studio/image-studio-store.ts..."
cat << 'FILE_EOF' > apps/image-studio/src/features/image-studio/image-studio-store.ts
import { create } from 'zustand';
import { connectorClient } from './connector-client';

interface ImageStudioState {
  inputImage: File | null;
  prompt: string;
  denoise: number;
  outputImageUrl: string | null;
  isGenerating: boolean;
  statusText: string;
  error: string | null;

  setInputImage: (file: File | null) => void;
  setPrompt: (prompt: string) => void;
  setDenoise: (val: number) => void;
  generateImage: () => Promise<void>;
}

export const useImageStudioStore = create<ImageStudioState>((set, get) => ({
  inputImage: null,
  prompt: '',
  denoise: 0.55,
  outputImageUrl: null,
  isGenerating: false,
  statusText: 'Ready.',
  error: null,

  setInputImage: (file) => set({ inputImage: file }),
  setPrompt: (prompt) => set({ prompt }),
  setDenoise: (denoise) => set({ denoise }),

  generateImage: async () => {
    const { inputImage, prompt, denoise } = get();

    if (!inputImage) {
      set({ error: 'Please upload an input image.' });
      return;
    }

    if (!prompt.trim()) {
      set({ error: 'Please enter a target prompt.' });
      return;
    }

    set({ isGenerating: true, statusText: 'Generating image on GPU...', error: null });

    try {
      const outputUrl = await connectorClient.generateImage({
        imageFile: inputImage,
        prompt,
        denoise,
      });

      set({
        outputImageUrl: outputUrl,
        isGenerating: false,
        statusText: 'Generation completed successfully!',
      });
    } catch (err: any) {
      set({
        isGenerating: false,
        statusText: 'Generation failed.',
        error: err.message || 'An unexpected error occurred.',
      });
    }
  },
}));
FILE_EOF

echo "📄 Updating apps/image-studio/.env configuration..."
cat << 'FILE_EOF' > apps/image-studio/.env
VITE_AI_PROVIDER=astramind
VITE_ASTRAMIND_BASE_URL=http://localhost:8000
FILE_EOF

# -----------------------------------------------------------------------------
# PART 3: Inject dependency into package.json and trigger pnpm install
# -----------------------------------------------------------------------------
echo "🔧 Adding @astramind/astramind-connector dependency to apps/image-studio/package.json..."
python3 -c "
import json

path = 'apps/image-studio/package.json'
with open(path, 'r') as f:
    data = json.load(f)

if 'dependencies' not in data:
    data['dependencies'] = {}

data['dependencies']['@astramind/astramind-connector'] = 'workspace:*'

with open(path, 'w') as f:
    json.dump(data, f, indent=2)
"

echo "📦 Linking monorepo workspace dependencies via pnpm..."
pnpm install

echo "✅ ALL DONE! AstraMind connector package created and integrated successfully."

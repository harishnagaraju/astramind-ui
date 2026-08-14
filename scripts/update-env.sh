#!/bin/bash
set -e

# Resolve repository root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

ENV_FILE="$ROOT_DIR/apps/image-studio/.env"

echo "⚙️ Configuring Environment File: $ENV_FILE"

# Make sure target app directory exists
mkdir -p "$ROOT_DIR/apps/image-studio"

# Write the runtime environment variables
cat << 'ENV_EOF' > "$ENV_FILE"
# Active AI Provider Configuration ('astramind' or 'comfyui')
VITE_AI_PROVIDER=astramind

# URL of your clean FastAPI PyTorch backend on Jarvislabs
VITE_ASTRAMIND_BASE_URL=https://9a969c4678831.notebooksn.jarvislabs.net:8000

# Legacy ComfyUI Fallback Settings
VITE_COMFYUI_BASE_URL=https://9a969c4678831.notebooksn.jarvislabs.net
VITE_COMFYUI_MODEL_FAMILY=stable-diffusion
VITE_COMFYUI_CHECKPOINT=realvisXL_v40.safetensors
ENV_EOF

echo "✅ Successfully updated apps/image-studio/.env"
echo "----------------------------------------"
cat "$ENV_FILE"
echo "----------------------------------------"

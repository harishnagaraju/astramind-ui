#!/bin/bash
set -e

# Resolve repository root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"
echo "📍 Working in repository root: $ROOT_DIR"
echo "📁 Creating backend/ directory structure..."

mkdir -p backend

# -----------------------------------------------------------------------------
# 1. backend/requirements.txt
# -----------------------------------------------------------------------------
echo "📄 Creating backend/requirements.txt..."
cat << 'FILE_EOF' > backend/requirements.txt
torch
torchvision
--extra-index-url https://download.pytorch.org/whl/cu121
diffusers
transformers
accelerate
safetensors
huggingface_hub
pillow
fastapi
uvicorn
python-multipart
FILE_EOF

# -----------------------------------------------------------------------------
# 2. backend/server.py
# -----------------------------------------------------------------------------
echo "📄 Creating backend/server.py..."
cat << 'FILE_EOF' > backend/server.py
import os
import io
import torch
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from diffusers import AutoPipelineForImage2Image
from PIL import Image

app = FastAPI(title="AstraMind GPU Engine")

# Enable CORS for cross-origin requests from the frontend UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.getenv("MODEL_DIR", "/home/app/models")
os.makedirs(MODEL_DIR, exist_ok=True)

print("Initializing PyTorch pipeline on GPU VRAM...")
pipe = AutoPipelineForImage2Image.from_pretrained(
    "stabilityai/stable-diffusion-xl-refiner-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
    cache_dir=MODEL_DIR
).to("cuda")

@app.get("/health")
def health():
    return {"status": "ok", "gpu": torch.cuda.get_device_name(0)}

@app.post("/api/img2img")
async def img2img(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    denoise: float = Form(0.55),
    steps: int = Form(25),
    guidance_scale: float = Form(7.5)
):
    try:
        image_bytes = await file.read()
        init_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Pure PyTorch inference (direct CUDA, zero censorship middleware)
        output_image = pipe(
            prompt=prompt,
            image=init_image,
            strength=denoise,
            num_inference_steps=steps,
            guidance_scale=guidance_scale
        ).images[0]

        buffer = io.BytesIO()
        output_image.save(buffer, format="PNG")
        return Response(content=buffer.getvalue(), media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
FILE_EOF

# -----------------------------------------------------------------------------
# 3. backend/setup.sh
# -----------------------------------------------------------------------------
echo "📄 Creating backend/setup.sh..."
cat << 'FILE_EOF' > backend/setup.sh
#!/bin/bash
set -e

# Target directory for persistent storage on Jarvislabs
TARGET_DIR="/home/app"

echo "📍 Preparing persistent directory at $TARGET_DIR..."
mkdir -p "$TARGET_DIR/models"

# Copy backend application files into persistent storage
cp server.py requirements.txt "$TARGET_DIR/"
cd "$TARGET_DIR"

if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment (.venv)..."
    python3 -m venv .venv
fi

echo "⚡ Activating .venv and installing requirements..."
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup complete!"
echo "To launch the server, run:"
echo "  cd /home/app && source .venv/bin/activate && python server.py"
FILE_EOF

chmod +x backend/setup.sh

# -----------------------------------------------------------------------------
# 4. backend/.env.example
# -----------------------------------------------------------------------------
echo "📄 Creating backend/.env.example..."
cat << 'FILE_EOF' > backend/.env.example
PORT=8000
MODEL_DIR=/home/app/models
CUDA_VISIBLE_DEVICES=0
FILE_EOF

# Ensure gitignores ignore heavy virtualenv and models if placed inside backend
if [ -f ".gitignore" ]; then
    if ! grep -q "backend/\.venv" .gitignore; then
        echo -e "\n# Backend virtualenv and models\nbackend/.venv/\nbackend/models/" >> .gitignore
    fi
fi

echo "✅ ALL 4 BACKEND FILES CREATED SUCCESSFULLY IN ./backend/"

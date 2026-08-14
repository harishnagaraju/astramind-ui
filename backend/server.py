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

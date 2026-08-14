# AstraMind Backend Engine (v0.1.0)

The **AstraMind Backend** is a lightweight, high-performance GPU inference microservice designed to serve generative AI workloads directly to the AstraMind UI without framework overhead, heavy middleware, or node-graph dependencies.

---

## 🎯 Purpose & Scope (v0.1.0)

In this stage of the AstraMind ecosystem:
- **Direct GPU Inference:** Replaces complex, heavyweight graph engines (like ComfyUI) with direct PyTorch and Hugging Face `diffusers` pipelines running on CUDA.
- **RESTful Connector Target:** Acts as the primary backend endpoint for `@astramind/astramind-connector`.
- **Stateless & Unconstrained:** Provides clean image-to-image (`img2img`) generation without hidden interceptors, prompt blockers, or complex WebSocket session states.
- **Persistent Cloud VM Ready:** Structured specifically for one-command deployment and volume persistence on remote GPU providers (such as Jarvislabs, RunPod, or bare-metal Linux servers).

---

## 📂 File Breakdown

| File | Type | Description |
| :--- | :--- | :--- |
| `server.py` | Python (FastAPI) | The core HTTP inference server. Loads the model pipeline into GPU VRAM once on startup and serves `/health` and `/api/img2img` endpoints. |
| `requirements.txt` | Dependency Manifest | Pins PyTorch (with CUDA 12.1 acceleration), Hugging Face Diffusers, Transformers, Accelerate, Pillow, and FastAPI. |
| `setup.sh` | Shell Script | Automated setup script for GPU servers. Prepares persistent storage (`/home/app`), initializes `.venv`, and installs all dependencies. |
| `.env.example` | Config Template | Template for setting backend environment variables (ports, model paths, and visible CUDA devices). |

---

## 🏗 Architecture & Request Flow

+---------------------------+
| AstraMind UI (Frontend)   |
| (apps/image-studio)       |
+-------------+-------------+
| HTTP POST (Image + Prompt)
v
+---------------------------+
| FastAPI Server (server.py)|
+-------------+-------------+
| Direct Tensor Operations
v
+---------------------------+
| PyTorch Diffusers Engine  |
| (SDXL Refiner / CUDA VRAM)|
+-------------+-------------+
| Raw Image Buffer (PNG)
v
+---------------------------+
| Output Rendered in UI     |
+---------------------------+


---

## 🚀 Quickstart: Deploying to a GPU Server (Jarvislabs / Linux)

### 1. Automated Setup via `setup.sh`
Run the automated installation script:
```bash
bash setup.sh
This script will:

Create /home/app/models for persistent model weights.

Copy application files to persistent storage.

Create and activate a Python virtual environment (.venv).

Install PyTorch with native CUDA 12.1 acceleration and required dependencies.

2. Launching the Backend
Once setup finishes, start the server:

Bash
cd /home/app
source .venv/bin/activate
python server.py
The server will start on port 8000 (or the port defined in PORT).

🔌 API Endpoints
GET /health
Verifies backend connectivity and checks GPU availability.

Response:

JSON
{
  "status": "ok",
  "gpu": "NVIDIA RTX A6000"
}
POST /api/img2img
Executes image-to-image diffusion inference.

Form Data Parameters:

file: (Binary) Input source image.

prompt: (String) Target generation prompt.

denoise: (Float, optional) Denoising strength (default: 0.55).

steps: (Integer, optional) Inference steps (default: 25).

guidance_scale: (Float, optional) CFG guidance scale (default: 7.5).

Response:

Returns raw image binary (image/png).

🔮 Future Roadmap (AstraMind Engine Optimization)
Future releases will introduce optimized C++/CUDA compute primitives below this layer (similar to IPP / MKL routines) to:

Replace Python framework overhead with lightweight, compiled C-ABI dynamic libraries.

Eliminate redundant memory allocations using fused attention and zero-copy tensor kernels.

Radically reduce runtime container/binary sizes and compute latency.


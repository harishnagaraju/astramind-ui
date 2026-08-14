cat << 'EOF' > README.md
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

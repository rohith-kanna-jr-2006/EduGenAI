"""
EduGenAI - Python SDXL Model Inference Service
FastAPI-based HTTP inference backend for Stable Diffusion XL (SDXL).

Runs on:
- Google Colab (with free/Pro GPU)
- Local GPU workstation (NVIDIA RTX / CUDA)
- RunPod, Lambda Labs, or AWS EC2

Installation:
    pip install fastapi uvicorn diffusers transformers accelerate torch pyngrok

Usage:
    python sdxl_server.py
"""

import time
import io
import base64
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

# Initialize FastAPI app
app = FastAPI(title="EduGenAI SDXL Model Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline holder
pipeline = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def load_pipeline():
    global pipeline
    if pipeline is not None:
        return pipeline

    print(f"Loading Stable Diffusion XL pipeline on device: {device}...")
    from diffusers import AutoPipelineForText2Image

    # Use SDXL Turbo or SDXL Base
    model_id = "stabilityai/sdxl-turbo" if device == "cpu" else "stabilityai/stable-diffusion-xl-base-1.0"
    
    torch_dtype = torch.float16 if device == "cuda" else torch.float32

    try:
        pipeline = AutoPipelineForText2Image.from_pretrained(
            model_id,
            torch_dtype=torch_dtype,
            variant="fp16" if device == "cuda" else None,
            use_safetensors=True
        )
        if device == "cuda":
            pipeline.to("cuda")
            try:
                pipeline.enable_xformers_memory_efficient_attention()
            except Exception:
                pass
        print(f"Pipeline successfully loaded ({model_id})!")
    except Exception as e:
        print(f"Error loading pipeline: {e}")
        raise e

    return pipeline


class GenerationRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = "low quality, blurry, deformed"
    num_inference_steps: int = Field(default=20, ge=1, le=100)
    guidance_scale: float = Field(default=7.0, ge=0.0, le=25.0)
    width: int = Field(default=1024, ge=256, le=2048)
    height: int = Field(default=1024, ge=256, le=2048)
    seed: Optional[int] = None


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "device": device,
        "cuda_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "pipeline_loaded": pipeline is not None
    }


@app.post("/generate")
def generate_image(req: GenerationRequest):
    pipe = load_pipeline()

    generator = None
    if req.seed is not None:
        generator = torch.Generator(device=device).manual_seed(req.seed)

    start_time = time.time()

    try:
        # Run diffusion inference with request parameters
        result = pipe(
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            num_inference_steps=req.num_inference_steps,
            guidance_scale=req.guidance_scale,
            width=req.width,
            height=req.height,
            generator=generator
        )

        image = result.images[0]
        elapsed = round(time.time() - start_time, 2)

        # Convert image to Base64 data URL
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=90)
        img_bytes = buffer.getvalue()
        base64_str = base64.b64encode(img_bytes).decode("utf-8")
        data_url = f"data:image/jpeg;base64,{base64_str}"

        gpu_mem = None
        if torch.cuda.is_available():
            gpu_mem = round(torch.cuda.memory_allocated(0) / (1024 * 1024), 2)

        return {
            "status": "success",
            "image": data_url,
            "metrics": {
                "inference_time_seconds": elapsed,
                "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
                "steps": req.num_inference_steps,
                "gpu_memory_allocated_mb": gpu_mem
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("Starting EduGenAI SDXL Inference Server on http://0.0.0.0:8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

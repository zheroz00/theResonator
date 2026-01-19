"""
Hugging Face audio processing routes.
Provides stem separation and denoising via HF Inference API.
"""

import logging
import os

from fastapi import APIRouter, HTTPException, Request

from app.config import get_settings
from app.models.schemas import (
    HFProcessRequest,
    HFStemResponse,
    HFDenoiseResponse,
    HFModelStatusResponse,
)
from app.services.huggingface import (
    separate_stems,
    denoise_audio,
    check_model_status,
    HuggingFaceError,
    MODELS,
)

router = APIRouter(prefix="/hf", tags=["huggingface"])
settings = get_settings()
logger = logging.getLogger(__name__)


@router.get("/status/{task}", response_model=HFModelStatusResponse)
async def get_model_status(task: str) -> HFModelStatusResponse:
    """Check if a model is ready for processing."""
    if task not in MODELS:
        raise HTTPException(
            status_code=400, detail=f"Unknown task: {task}. Available: {list(MODELS.keys())}"
        )

    result = await check_model_status(MODELS[task])
    return HFModelStatusResponse(**result)


@router.post("/separate-stems", response_model=HFStemResponse)
async def api_separate_stems(req: HFProcessRequest, request: Request) -> HFStemResponse:
    """
    Separate audio into stems using Demucs.
    Returns vocals, drums, bass, and other stems.
    """
    input_path = os.path.join(settings.OUTPUT_DIR, req.filename)

    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    try:
        logger.info(f"Starting stem separation for: {req.filename}")
        stem_files = await separate_stems(input_path, settings.OUTPUT_DIR)

        return HFStemResponse(
            status="success",
            stems=stem_files,
        )

    except HuggingFaceError as e:
        logger.error(f"HF API error: {e.message}")
        raise HTTPException(status_code=e.status_code or 500, detail=e.message)
    except Exception as e:
        logger.error(f"Stem separation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/denoise", response_model=HFDenoiseResponse)
async def api_denoise_audio(req: HFProcessRequest, request: Request) -> HFDenoiseResponse:
    """
    Denoise/enhance audio using SpeechBrain model.
    Returns a cleaned version of the audio.
    """
    input_path = os.path.join(settings.OUTPUT_DIR, req.filename)

    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    try:
        logger.info(f"Starting denoising for: {req.filename}")
        output_filename = await denoise_audio(input_path, settings.OUTPUT_DIR)

        url = str(request.url_for("output", path=output_filename))

        return HFDenoiseResponse(
            status="success",
            filename=output_filename,
            url=url,
        )

    except HuggingFaceError as e:
        logger.error(f"HF API error: {e.message}")
        raise HTTPException(status_code=e.status_code or 500, detail=e.message)
    except Exception as e:
        logger.error(f"Denoising failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

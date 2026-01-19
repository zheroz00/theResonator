"""
Hugging Face Inference API service for audio processing.
Supports stem separation (Demucs) and audio denoising.
"""

import base64
import io
import logging
import os
from typing import Optional

import httpx
import soundfile as sf

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

HF_API_URL = "https://api-inference.huggingface.co/models"

# Model IDs for different audio processing tasks
MODELS = {
    "demucs": "facebook/demucs",
    "denoise": "speechbrain/sepformer-wham16k-enhancement",
}


class HuggingFaceError(Exception):
    """Custom exception for Hugging Face API errors."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def _get_headers() -> dict:
    """Get headers for HF API requests."""
    headers = {"Content-Type": "application/octet-stream"}
    if settings.HF_API_TOKEN:
        headers["Authorization"] = f"Bearer {settings.HF_API_TOKEN}"
    return headers


async def check_model_status(model_id: str) -> dict:
    """Check if a model is loaded and ready on HF Inference API."""
    url = f"{HF_API_URL}/{model_id}"
    headers = _get_headers()
    headers["Content-Type"] = "application/json"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                return {"status": "ready", "model": model_id}
            elif response.status_code == 503:
                data = response.json()
                estimated_time = data.get("estimated_time", "unknown")
                return {
                    "status": "loading",
                    "model": model_id,
                    "estimated_time": estimated_time,
                }
            else:
                return {"status": "error", "model": model_id, "code": response.status_code}
        except Exception as e:
            logger.error(f"Error checking model status: {e}")
            return {"status": "error", "model": model_id, "message": str(e)}


async def separate_stems(audio_path: str, output_dir: str) -> dict[str, str]:
    """
    Separate audio into stems using Demucs model.

    Args:
        audio_path: Path to input audio file
        output_dir: Directory to save output stems

    Returns:
        Dictionary mapping stem names to output filenames
    """
    model_id = MODELS["demucs"]
    url = f"{HF_API_URL}/{model_id}"

    # Read audio file
    with open(audio_path, "rb") as f:
        audio_data = f.read()

    headers = _get_headers()

    async with httpx.AsyncClient(timeout=settings.HF_API_TIMEOUT) as client:
        logger.info(f"Sending audio to Demucs for stem separation...")

        try:
            response = await client.post(url, headers=headers, content=audio_data)
        except httpx.TimeoutException:
            raise HuggingFaceError("Request timed out. The model may be loading.", 408)

        if response.status_code == 503:
            data = response.json()
            estimated_time = data.get("estimated_time", 60)
            raise HuggingFaceError(
                f"Model is loading. Estimated wait: {estimated_time}s. Please retry.",
                503,
            )

        if response.status_code != 200:
            error_msg = response.text[:200] if response.text else "Unknown error"
            raise HuggingFaceError(f"HF API error: {error_msg}", response.status_code)

        # Parse response - Demucs returns multiple audio tracks
        result = response.json()

        if not isinstance(result, dict):
            raise HuggingFaceError("Unexpected response format from Demucs")

        # Get base filename for outputs
        base_name = os.path.splitext(os.path.basename(audio_path))[0]
        stem_files = {}

        for stem_name, audio_b64 in result.items():
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_b64)

            # Save stem file
            stem_filename = f"{base_name}_stem_{stem_name}.wav"
            stem_path = os.path.join(output_dir, stem_filename)

            with open(stem_path, "wb") as f:
                f.write(audio_bytes)

            stem_files[stem_name] = stem_filename
            logger.info(f"Saved stem: {stem_filename}")

        return stem_files


async def denoise_audio(audio_path: str, output_dir: str) -> str:
    """
    Denoise/enhance audio using SpeechBrain SepFormer model.

    Args:
        audio_path: Path to input audio file
        output_dir: Directory to save output

    Returns:
        Filename of the denoised audio
    """
    model_id = MODELS["denoise"]
    url = f"{HF_API_URL}/{model_id}"

    # Read audio file
    with open(audio_path, "rb") as f:
        audio_data = f.read()

    headers = _get_headers()

    async with httpx.AsyncClient(timeout=settings.HF_API_TIMEOUT) as client:
        logger.info(f"Sending audio for denoising...")

        try:
            response = await client.post(url, headers=headers, content=audio_data)
        except httpx.TimeoutException:
            raise HuggingFaceError("Request timed out. The model may be loading.", 408)

        if response.status_code == 503:
            data = response.json()
            estimated_time = data.get("estimated_time", 60)
            raise HuggingFaceError(
                f"Model is loading. Estimated wait: {estimated_time}s. Please retry.",
                503,
            )

        if response.status_code != 200:
            error_msg = response.text[:200] if response.text else "Unknown error"
            raise HuggingFaceError(f"HF API error: {error_msg}", response.status_code)

        # Response is raw audio bytes
        audio_bytes = response.content

        # Generate output filename
        base_name = os.path.splitext(os.path.basename(audio_path))[0]
        output_filename = f"{base_name}_denoised.wav"
        output_path = os.path.join(output_dir, output_filename)

        # Save denoised audio
        with open(output_path, "wb") as f:
            f.write(audio_bytes)

        logger.info(f"Saved denoised audio: {output_filename}")
        return output_filename

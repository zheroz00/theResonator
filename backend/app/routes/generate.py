import os
import uuid

from fastapi import APIRouter, HTTPException, Request

from app.config import get_settings
from app.database.repository import SongRepository
from app.models.schemas import GenerateRequest, AudioResponse
from app.services import musicgen

router = APIRouter()
settings = get_settings()


@router.post("/generate", response_model=AudioResponse)
async def generate_music(req: GenerateRequest, request: Request) -> AudioResponse:
    try:
        filename = f"gen_{uuid.uuid4()}"
        output_path = os.path.join(settings.OUTPUT_DIR, filename)

        musicgen.generate_audio(req.prompt, req.duration, output_path)

        final_filename = f"{filename}.wav"
        url = str(request.url_for("output", path=final_filename))

        # Create song record in database
        SongRepository.create(
            prompt=req.prompt,
            duration=req.duration,
            filename=final_filename,
        )

        return AudioResponse(
            status="success",
            filename=final_filename,
            url=url,
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

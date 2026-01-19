import os

from fastapi import APIRouter, HTTPException, Request

from app.config import get_settings
from app.database.repository import SongRepository
from app.models.schemas import ProcessRequest, AudioResponse
from app.services import effects

router = APIRouter()
settings = get_settings()


@router.post("/process", response_model=AudioResponse)
async def process_music(req: ProcessRequest, request: Request) -> AudioResponse:
    try:
        input_path = os.path.join(settings.OUTPUT_DIR, req.filename)

        if not os.path.exists(input_path):
            raise HTTPException(status_code=404, detail="File not found on server")

        output_filename = f"tickled_{req.filename}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)

        effects.apply_effects(input_path, output_path)

        # Update song record with processed filename
        song = SongRepository.get_by_filename(req.filename)
        if song:
            SongRepository.update(song["id"], processed_filename=output_filename)

        url = str(request.url_for("output", path=output_filename))

        return AudioResponse(
            status="success",
            filename=output_filename,
            url=url,
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

import os

from fastapi import APIRouter, HTTPException, Request, Query

from app.config import get_settings
from app.database.repository import SongRepository
from app.models.schemas import SongResponse, SongListResponse, SongUpdate

router = APIRouter()
settings = get_settings()


def song_to_response(song: dict, request: Request) -> SongResponse:
    """Convert database row to response model with URLs."""
    return SongResponse(
        id=song["id"],
        prompt=song["prompt"],
        duration=song["duration"],
        filename=song["filename"],
        processed_filename=song["processed_filename"],
        custom_name=song["custom_name"],
        is_favorite=bool(song["is_favorite"]),
        created_at=song["created_at"],
        updated_at=song["updated_at"],
        url=str(request.url_for("output", path=song["filename"])),
        processed_url=(
            str(request.url_for("output", path=song["processed_filename"]))
            if song["processed_filename"]
            else None
        ),
    )


@router.get("/songs", response_model=SongListResponse)
async def list_songs(
    request: Request,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """List all songs, ordered by newest first."""
    songs = SongRepository.get_all(limit, offset)
    total = SongRepository.count()
    return SongListResponse(
        songs=[song_to_response(s, request) for s in songs],
        total=total,
    )


@router.get("/songs/{song_id}", response_model=SongResponse)
async def get_song(song_id: int, request: Request):
    """Get a single song by ID."""
    song = SongRepository.get_by_id(song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song_to_response(song, request)


@router.patch("/songs/{song_id}", response_model=SongResponse)
async def update_song(song_id: int, update: SongUpdate, request: Request):
    """Update a song's metadata (name, favorite status)."""
    existing = SongRepository.get_by_id(song_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Song not found")

    song = SongRepository.update(
        song_id,
        custom_name=update.custom_name,
        is_favorite=update.is_favorite,
    )
    return song_to_response(song, request)


@router.delete("/songs/{song_id}")
async def delete_song(song_id: int):
    """Delete a song and its audio files from disk."""
    song = SongRepository.get_by_id(song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    # Delete audio files from disk
    for filename in [song["filename"], song["processed_filename"]]:
        if filename:
            filepath = os.path.join(settings.OUTPUT_DIR, filename)
            if os.path.exists(filepath):
                os.remove(filepath)

    SongRepository.delete(song_id)
    return {"status": "deleted", "id": song_id}

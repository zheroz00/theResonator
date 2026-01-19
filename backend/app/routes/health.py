from fastapi import APIRouter

from app.models.schemas import HealthResponse
from app.services import musicgen

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=musicgen.is_model_loaded(),
        device=musicgen.get_device(),
    )

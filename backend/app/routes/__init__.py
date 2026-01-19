from fastapi import APIRouter
from app.routes import generate, process, health, songs, hf_process

router = APIRouter()
router.include_router(health.router, tags=["health"])
router.include_router(generate.router, tags=["generation"])
router.include_router(process.router, tags=["processing"])
router.include_router(songs.router, tags=["songs"])
router.include_router(hf_process.router)

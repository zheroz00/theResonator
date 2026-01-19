import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import init_db, checkpoint_db, SongRepository
from app.services import musicgen

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting The Resonator...")
    init_db()

    # Validate songs and clean up orphaned records
    result = SongRepository.validate_and_cleanup()
    logger.info(f"Validated {result['validated']} songs, removed {result['removed']} orphans")

    musicgen.load_model()
    logger.info("Startup complete")

    yield

    # Shutdown - checkpoint WAL to ensure durability
    logger.info("Shutting down...")
    checkpoint_db()
    logger.info("Shutdown complete")

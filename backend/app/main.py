from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.core.lifespan import lifespan
from app.routes import router

settings = get_settings()

app = FastAPI(
    title="The Resonator",
    description="Generative Bass Music API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount output directory for audio file serving
app.mount("/output", StaticFiles(directory=settings.OUTPUT_DIR), name="output")

# Include API routes
app.include_router(router)

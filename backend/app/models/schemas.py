from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    duration: int = Field(default=15, ge=1, le=60)


class ProcessRequest(BaseModel):
    filename: str = Field(..., min_length=1)


class AudioResponse(BaseModel):
    status: str
    filename: str
    url: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str


class ErrorResponse(BaseModel):
    detail: str


# Song schemas for persistence
class SongUpdate(BaseModel):
    custom_name: Optional[str] = None
    is_favorite: Optional[bool] = None


class SongResponse(BaseModel):
    id: int
    prompt: str
    duration: int
    filename: str
    processed_filename: Optional[str] = None
    custom_name: Optional[str] = None
    is_favorite: bool = False
    created_at: datetime
    updated_at: datetime
    url: str
    processed_url: Optional[str] = None

    class Config:
        from_attributes = True


class SongListResponse(BaseModel):
    songs: list[SongResponse]
    total: int


# Hugging Face processing schemas
class HFProcessRequest(BaseModel):
    filename: str = Field(..., min_length=1)


class HFStemResponse(BaseModel):
    status: str
    stems: dict[str, str]  # stem_name -> filename


class HFDenoiseResponse(BaseModel):
    status: str
    filename: str
    url: str


class HFModelStatusResponse(BaseModel):
    status: str
    model: str
    estimated_time: Optional[float] = None
    message: Optional[str] = None

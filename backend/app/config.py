import os
from functools import lru_cache


class Settings:
    MODEL_NAME: str = os.getenv("MODEL_NAME", "facebook/musicgen-stereo-large")
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", "/app/output")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    DEFAULT_DURATION: int = int(os.getenv("DEFAULT_DURATION", "15"))
    MAX_DURATION: int = int(os.getenv("MAX_DURATION", "60"))

    # Hugging Face Inference API settings
    HF_API_TOKEN: str = os.getenv("HF_API_TOKEN", "")
    HF_API_TIMEOUT: int = int(os.getenv("HF_API_TIMEOUT", "300"))  # 5 minutes for long audio

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()

import torch
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write

from app.config import get_settings

settings = get_settings()

_model: MusicGen | None = None
_device: str = "cpu"


def get_device() -> str:
    return _device


def is_model_loaded() -> bool:
    return _model is not None


def load_model() -> None:
    global _model, _device

    _device = "cuda" if torch.cuda.is_available() else "cpu"
    if _device == "cpu":
        print("WARNING: No GPU detected. Generation will be slow!")

    print(f"Loading Model: {settings.MODEL_NAME}...")
    _model = MusicGen.get_pretrained(settings.MODEL_NAME, device=_device)
    print("Model Loaded and Ready.")


def generate_audio(prompt: str, duration: int, output_path: str) -> None:
    if _model is None:
        raise RuntimeError("Model not loaded")

    _model.set_generation_params(duration=duration)
    print(f"Generating: {prompt}...")

    wav = _model.generate([prompt])

    audio_write(
        output_path,
        wav[0].cpu(),
        _model.sample_rate,
        strategy="loudness",
        loudness_compressor=True,
    )

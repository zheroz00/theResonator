from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write
from pedalboard import Pedalboard, Chorus, Reverb, Compressor, Limiter, HighpassFilter
from pedalboard.io import AudioFile
import torch
import os
import uuid

app = FastAPI()

# --- MOUNT OUTPUT FOLDER ---
# This allows n8n to download files via http://IP:5000/output/filename.wav
app.mount("/output", StaticFiles(directory="/app/output"), name="output")

# --- CONFIGURATION ---
MODEL_SIZE = "facebook/musicgen-stereo-large"

print(f"⏳ Loading Model: {MODEL_SIZE}...")
device = 'cuda' if torch.cuda.is_available() else 'cpu'
if device == 'cpu':
    print("⚠️ WARNING: No GPU detected. Generation will be slow!")

model = MusicGen.get_pretrained(MODEL_SIZE, device=device)
print("✅ Model Loaded and Ready.")

# --- THE BRAIN TICKLER CHAIN ---
tickler_board = Pedalboard([
    # 1. Clean up mud
    HighpassFilter(cutoff_frequency_hz=30),
    
    # 2. The "Ooze" Factor
    Chorus(rate_hz=1.0, depth=0.15, centre_delay_ms=7.0, feedback=0.0, mix=0.3),
    
    # 3. The "Zap" Factor
    Compressor(threshold_db=-12, ratio=3, attack_ms=2, release_ms=50),
    
    # 4. Safety
    Limiter(threshold_db=-1.0)
])

# --- REQUEST MODELS ---
class GenRequest(BaseModel):
    prompt: str
    duration: int = 15

class ProcessRequest(BaseModel):
    filename: str

# --- ENDPOINT 1: GENERATE RAW AUDIO ---
@app.post("/generate")
async def generate_music(req: GenRequest):
    try:
        # 1. GENERATE
        model.set_generation_params(duration=req.duration)
        print(f"🎵 Generating Raw: {req.prompt}...")
        wav = model.generate([req.prompt])
        
        # 2. SAVE RAW FILE
        filename = f"gen_{uuid.uuid4()}"
        path_prefix = f"/app/output/{filename}"
        
        # AudioCraft saves as .wav automatically
        audio_write(path_prefix, wav[0].cpu(), model.sample_rate, strategy="loudness", loudness_compressor=True)
        final_filename = f"{filename}.wav"
        
        return {
            "status": "success", 
            "filename": final_filename, 
            "url": f"http://10.10.10.158:6000/output/{final_filename}"
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT 2: APPLY EFFECTS ---
@app.post("/process")
async def process_music(req: ProcessRequest):
    try:
        input_path = f"/app/output/{req.filename}"
        output_filename = f"tickled_{req.filename}"
        output_path = f"/app/output/{output_filename}"
        
        # Check if file exists
        if not os.path.exists(input_path):
            raise HTTPException(status_code=404, detail="File not found on server")

        print(f"🧠 Applying Brain Tickles to: {req.filename}")
        
        # 1. READ RAW FILE
        with AudioFile(input_path) as f:
            audio = f.read(f.frames)
            samplerate = f.samplerate
            
        # 2. APPLY EFFECTS
        effected = tickler_board(audio, samplerate)
        
        # 3. SAVE PROCESSED FILE
        with AudioFile(output_path, 'w', samplerate, effected.shape[0]) as f:
            f.write(effected)
            
        return {
            "status": "success", 
            "filename": output_filename, 
            "url": f"http://10.10.10.158:6000/output/{output_filename}"
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
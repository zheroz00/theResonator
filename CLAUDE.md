# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**"The Resonator"** - A full-stack generative audio application using Meta's MusicGen model. Features a React frontend with WaveSurfer.js visualization and a modular FastAPI backend with "Brain Tickler" audio effects processing. Designed for local deployment with NVIDIA GPU support.

## Build and Run Commands

```bash
# Build and start both services (requires NVIDIA GPU)
docker compose up --build -d

# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend

# Rebuild after code changes
docker compose up --build -d

# Stop all services
docker compose down

# Check backend health
curl http://localhost:6000/health
```

## Access Points

- **Frontend**: http://localhost:6001
- **Backend API**: http://localhost:6000
- **Audio files**: http://localhost:6001/api/output/{filename}

## Project Structure

```
musicgen-server/
├── backend/                 # Modular FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI app with CORS
│   │   ├── config.py        # Environment configuration
│   │   ├── models/
│   │   │   └── schemas.py   # Pydantic request/response models
│   │   ├── routes/
│   │   │   ├── generate.py  # POST /generate
│   │   │   ├── process.py   # POST /process
│   │   │   └── health.py    # GET /health
│   │   ├── services/
│   │   │   ├── musicgen.py  # MusicGen model wrapper
│   │   │   └── effects.py   # Brain Tickler effects chain
│   │   └── core/
│   │       └── lifespan.py  # Startup/shutdown events
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   └── api/             # Backend API client
│   ├── nginx.conf           # Reverse proxy config
│   ├── package.json
│   └── Dockerfile
├── server.py                # Legacy monolithic backend (kept for fallback)
├── docker-compose.yml       # Multi-service orchestration
└── generated_music/         # Output directory (volume mount)
```

## Architecture

### Backend (FastAPI)

- **Model loading**: Loaded once at startup via lifespan context manager
- **CORS**: Configured via `CORS_ORIGINS` environment variable
- **Routes**: Modular routers in `app/routes/`
- **Services**: Business logic isolated in `app/services/`

### Frontend (React + Vite)

- **Waveform**: WaveSurfer.js for audio visualization
- **Session history**: Tracks all generated audio in session
- **API proxy**: nginx proxies `/api/*` requests to backend

### Audio Pipeline

1. `POST /generate` → MusicGen generates raw audio → saves as `.wav`
2. `POST /process` → Applies Brain Tickler effects chain → saves as `tickled_*.wav`

**Brain Tickler Chain**: HighpassFilter(30Hz) → Chorus → Compressor → Limiter

## Key Dependencies

### Backend
- `audiocraft` - Meta's MusicGen (from GitHub)
- `pedalboard==0.8.9` - Audio effects
- `transformers>=4.31.0,<4.40.0` - Compatibility pin

### Frontend
- `wavesurfer.js` - Waveform visualization
- `axios` - HTTP client
- `react-icons` - Icons

## API Examples

```bash
# Generate music
curl -X POST http://localhost:6000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "neurofunk bass with reese growl", "duration": 15}'

# Apply effects
curl -X POST http://localhost:6000/process \
  -H "Content-Type: application/json" \
  -d '{"filename": "gen_abc123.wav"}'

# Health check
curl http://localhost:6000/health
```

## Volume Mounts

- `./generated_music:/app/output` - Generated audio files
- `./model_cache:/root/.cache` - Persisted model weights (~6GB)

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_NAME` | `facebook/musicgen-stereo-large` | MusicGen model to use |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins |
| `OUTPUT_DIR` | `/app/output` | Directory for generated files |
| `DEFAULT_DURATION` | `15` | Default audio duration (seconds) |
| `MAX_DURATION` | `60` | Maximum allowed duration |
| `XFORMERS_DISABLED` | `1` | Disable xformers optimizations |

### Frontend (build-time)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_OPENROUTER_API_KEY` | (empty) | OpenRouter API key for AI prompt generation. Get one at https://openrouter.ai/keys |
| `VITE_OPENROUTER_MODEL` | `anthropic/claude-3-haiku` | OpenRouter model for prompt generation |

To use the AI prompt randomizer, copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your API key and preferred model
docker compose up --build -d
```

Available models include: `anthropic/claude-3-haiku`, `anthropic/claude-3-sonnet`, `openai/gpt-4o-mini`, `google/gemini-flash-1.5`

## Development Workflow

```bash
# Frontend hot-reload development (outside Docker)
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000

# Backend-only Docker (for frontend dev)
docker compose up backend -d
```

When developing frontend locally, update [frontend/src/api/resonator.js](frontend/src/api/resonator.js) to point directly to `http://localhost:6000` instead of `/api`.

## Legacy Fallback

To use the original monolithic `server.py` instead of the modular backend:

1. Comment out the `backend` service in `docker-compose.yml`
2. Uncomment the `musicgen` service block
3. Run `docker compose up --build -d`

FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

# Install system dependencies for audio processing
# pkg-config and build-essential needed to compile av (PyAV) from source
# FFmpeg dev libs needed for PyAV compilation
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y ffmpeg git tzdata pkg-config \
    build-essential libavcodec-dev libavformat-dev libavdevice-dev libavutil-dev \
    libavfilter-dev libswscale-dev libswresample-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server.py .

# Create output directory
RUN mkdir -p /app/output

# Expose port
EXPOSE 5000

# Run the server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "5000"]

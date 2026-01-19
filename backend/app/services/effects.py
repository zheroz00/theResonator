from pedalboard import Pedalboard, Chorus, Reverb, Compressor, Limiter, HighpassFilter
from pedalboard.io import AudioFile

# The Brain Tickler Chain
# Designed for bass music that triggers physical sensations
tickler_board = Pedalboard([
    # 1. Clean up mud below 30Hz
    HighpassFilter(cutoff_frequency_hz=30),

    # 2. The "Ooze" Factor - subtle modulation
    Chorus(rate_hz=1.0, depth=0.15, centre_delay_ms=7.0, feedback=0.0, mix=0.3),

    # 3. The "Zap" Factor - punch and transient shaping
    Compressor(threshold_db=-12, ratio=3, attack_ms=2, release_ms=50),

    # 4. Safety limiter
    Limiter(threshold_db=-1.0),
])


def apply_effects(input_path: str, output_path: str) -> None:
    print(f"Applying Brain Tickles to: {input_path}")

    with AudioFile(input_path) as f:
        audio = f.read(f.frames)
        samplerate = f.samplerate

    effected = tickler_board(audio, samplerate)

    with AudioFile(output_path, "w", samplerate, effected.shape[0]) as f:
        f.write(effected)

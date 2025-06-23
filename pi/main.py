## Main entry point for the Pi application
import yaml
from pathlib import Path
from audio_capture import AudioCapture, LiveStream

def load_config(config_file):
    with open(config_file, "r") as f:
        return yaml.safe_load(f)

if __name__ == "__main__":
    config_path = Path(__file__).parent / "config" / "audio.yaml"
    config = load_config(config_path)

    segments_dir = (Path(__file__).parent / config["paths"]["segments_dir"]).resolve()
    segments_dir.mkdir(parents=True, exist_ok=True)

    audio_cfg = {
        "sample_rate": config["audio"]["sample_rate"],
        "channels": config["audio"]["channels"],
        "dtype": config["audio"].get("dtype", "int16"),
        "segment_duration": config["segments"]["duration"],
        "segment_overlap": config["segments"]["overlap"],
        "segments_dir": segments_dir  # Pass the Path object
    }

    capture = AudioCapture(audio_cfg)
    capture.start()

    """
    capture = AudioCapture(audio_cfg)
    livestream = LiveStream(
        sample_rate=audio_cfg["sample_rate"],
        channels=audio_cfg["channels"],
        dtype=audio_cfg["dtype"]
    )
    livestream.start()
    capture.add_listener(livestream.play_audio)
    capture.start()
    """
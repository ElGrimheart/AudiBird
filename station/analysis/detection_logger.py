import csv
from pathlib import Path
from datetime import datetime
import json

class DetectionLogger:
    def __init__(self, config):
        self.station_metadata = config.get("station_metadata", {})
        self.audio_metadata = config.get("audio_metadata", {})
        self.processing_metadata = config.get("processing_metadata", {})
        
        self.log_path = Path(config.get("detections_log")).resolve()
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.log_path.exists():
            with open(self.log_path, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "filename", "start_time", "end_time", "common_name",
                    "scientific_name", "confidence", "detection_timestamp", "audio_metadata", "processing_metadata", "station_id"
                ])

    def log(self, filename, detection):
        with open(self.log_path, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                filename,
                detection.get("start_time"),
                detection.get("end_time"),
                detection.get("common_name"),
                detection.get("scientific_name"),
                detection.get("confidence"),
                datetime.strptime(filename, "%Y%m%d_%H%M%S_%f"),
                json.dumps(self.station_metadata),
                json.dumps(self.audio_metadata),
                json.dumps(self.processing_metadata)
            ])
        print(f"Detection logged for {filename}: {detection.get('common_name')} ({detection.get('confidence')})")
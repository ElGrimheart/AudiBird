import csv
from pathlib import Path
from datetime import datetime
import json

class DetectionLogger:
    def __init__(self, config):
        self._station_metadata = config.get("station_metadata", {})
        self._audio_metadata = config.get("audio_metadata", {})
        self._processing_metadata = config.get("processing_metadata", {})
        
        self._log_path = Path(config.get("detections_log")).resolve()
        self._log_path.parent.mkdir(parents=True, exist_ok=True)
        
        if not self._log_path.exists():
            with open(self._log_path, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "filename", 
                    "common_name", 
                    "scientific_name", 
                    "confidence", 
                    "alternative_species", 
                    "detection_timestamp", 
                    "station_metadata", 
                    "audio_metadata", 
                    "processing_metadata", 
                    "station_id"
                ])

    def log(self, detection):

        self._audio_metadata["duration"] = detection.get("duration")

        with open(self._log_path, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                detection.get("recording_filename"),
                detection.get("common_name"),
                detection.get("scientific_name"),
                detection.get("confidence"),
                detection.get("alternatives"),
                datetime.strptime(Path(detection.get("recording_filename")).stem, "%Y%m%d_%H%M%S_%f"),
                json.dumps(self._station_metadata),
                json.dumps(self._audio_metadata),
                json.dumps(self._processing_metadata),
                self._station_metadata.get("station_id")
            ])
        print(f"Detection logged for {detection.get('recording_filename')}: {detection.get('common_name')} ({detection.get('confidence')})")
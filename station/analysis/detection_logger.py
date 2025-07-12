import csv
from pathlib import Path
from datetime import datetime
import json
from services.post_detection import post_detection

class DetectionLogger:
    def __init__(self, log_path):
        self.log_path = Path(log_path).resolve()
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.log_path.exists():
            with open(self.log_path, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "filename", "start_time", "end_time", "common_name",
                    "scientific_name", "confidence", "detection_timestamp", "audio_metadata", "processing_metadata", "station_id"
                ])

    def log(self, filename, detection, audio_metadata, processing_metadata):
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
                json.dumps(audio_metadata),
                json.dumps(processing_metadata)
            ])
        print(f"Detection logged for {filename}: {detection.get('common_name')} ({detection.get('confidence')})")
        
        
    def post_detection(self, detection, audio_metadata, processing_metadata):
        """Posts a detection to the remote database API.

        Args:
            detection (dict): The detection data to be posted.
            audio_metadata (dict): Metadata about the audio segment.

        Returns:
            dict: The response from the API.
        """
        post_detection(detection, audio_metadata, processing_metadata)
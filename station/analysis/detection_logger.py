import csv
from pathlib import Path

class DetectionLogger:
    def __init__(self, log_path):
        self.log_path = Path(log_path).resolve()
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.log_path.exists():
            with open(self.log_path, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "filename", "start_time", "end_time", "common_name",
                    "scientific_name", "confidence", "label"
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
                detection.get("label"),
            ])
        print(f"Detection logged for {filename}: {detection.get('common_name')} ({detection.get('confidence')})")
"""Handles BirdNET analysis of audio segments and logs detections."""
import queue
from pathlib import Path
from datetime import datetime, timezone
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer as BirdnetAnalyzer


class Analyser:
    """Analyser class for processing audio segments with BirdNET and logging detections.
    
    Args:
        config (dict): Configuration parameters for the analyser.
        detection_logger (DetectionLogger): Logger to handle detection logging.
        
    Methods:
        analyse_segment(filename): Analyse a single audio segment file and log detections.
        add_segment(filename): Add a segment filename to the analysis queue.
        start(): Continuously process segments from the queue.
        stop(): Stop the analyser.
    """
    
    def __init__(self, config):
        """Initialize the Analyser with configuration parameters.
        Note - analyser_min_confidence is locked to 0.1 to ensure that all predictions are returned
        user_min_confidence is then used to filter predictions based on user preferences.
        """
        self._lat = config.get("lat", None)
        self._lon = config.get("lon", None)
        self._analyser_min_confidence = config.get("birdnet_min_confidence", 0.1)
        self._sensitivity = config.get("sensitivity", 1.5)
        self._user_min_confidence = config.get("user_min_confidence", 0.35)

        self._birdnet_model = BirdnetAnalyzer()
        self._analysis_queue = queue.Queue()
        self._segments_dir = Path(config.get("segments_dir", "pi/data/segments")).resolve()

        self._running = False


    def analyse_segment(self, filename, top_n=5):
        """Analyses a single audio segment file and  returns detections.
        
        Args:
            filename (str): Name of the audio segment file to analyze.
        """
        filepath = self._segments_dir / f"{filename}.wav"
        current_datetime = datetime.now(timezone.utc)
        
        # Analyse segment with BirdNet
        recording = Recording(
            self._birdnet_model,
            str(filepath),
            lat=self._lat,
            lon=self._lon,
            date=current_datetime,
            min_conf=self._analyser_min_confidence,
            sensitivity=self._sensitivity,
        )
        recording.analyze()
        
        # Sort detections by confidence
        sorted_predictions = sorted(
            recording.detections,
            key=lambda x: x["confidence"],
            reverse=True
        )

        # Determine if any viable detections were found, otherwise return empty array
        if not sorted_predictions:
            print("No detections found in segment.")
            return []
        
        if sorted_predictions[0]["confidence"] < self._user_min_confidence:
            print("No detections above user confidence threshold.")
            return []


        # Set primary detection
        primary_detection = sorted_predictions[0]

        # Loop through remaining detections to extract alternative species (excluding the primary detection)
        unique_species = set()
        alternative_species = []
        for alt_detection in sorted_predictions[1:]:
            key = alt_detection["common_name"]
            if key not in unique_species:
                alternative_species.append({
                    "common_name": alt_detection["common_name"],
                    "scientific_name": alt_detection["scientific_name"],
                    "confidence": alt_detection["confidence"]
                })
                unique_species.add(key)
            if len(alternative_species) >= top_n - 1:
                break

        detection = {
            "common_name": primary_detection["common_name"],
            "scientific_name": primary_detection["scientific_name"],
            "confidence": primary_detection["confidence"],
            "timestamp": current_datetime.isoformat(),
            "alternatives": alternative_species,
            "segment_filename": str(filepath)
        }
        print("Detection result:", detection)
        
        return detection
        


    def add_segment(self, filename):
        """Adds a segment filename to the analysis queue.
        Args:
            filename (str): Name of the audio segment file to add to the queue.
        """

        self._analysis_queue.put(filename)
        print(f"Segment {filename} added to analysis queue.")
    

    def start(self):
        """Continuously processes segments from the analysis queue.
        
        Args:
            None
        
        Atributes:
            running (bool): Flag to indicate if the analyser is currently running.
        """

        self._running = True
        while self._running:
            try:
                filename, audio_metadata, processing_metadata = self._analysis_queue.get(timeout=1)
                if not self._running:
                    break

                self.analyse_segment(filename, audio_metadata, processing_metadata)
                self._analysis_queue.task_done()
            except queue.Empty:
                continue

    def stop(self):
        """Stops the analyser from processing segments.
        Args:
            None
        Atributes:
            running (bool): Flag to indicate if the analyser is currently running.
        """
        self._running = False
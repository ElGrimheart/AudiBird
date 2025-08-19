"""Handles BirdNET analysis of audio segments and logs detections."""
import queue
from pathlib import Path
from datetime import datetime
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
        self._lat = config.get("lat", None)
        self._lon = config.get("lon", None)
        self._min_conf = config.get("min_conf", 0.25)

        self._birdnet_analyzer = BirdnetAnalyzer()
        self._analysis_queue = queue.Queue()
        self._segments_dir = Path(config.get("segments_dir", "pi/data/segments")).resolve()

        self._running = False


    def analyse_segment(self, filename):
        """Analyses a single audio segment file and  returns detections.
        
        Args:
            filename (str): Name of the audio segment file to analyze.
        """
        print("Min confidence:", self._min_conf)

        filepath = self._segments_dir / f"{filename}.wav"
        recording = Recording(
            self._birdnet_analyzer,
            str(filepath),
            lat=self._lat,
            lon=self._lon,
            date=datetime.strptime(filename, "%Y%m%d_%H%M%S_%f"),
            min_conf=self._min_conf
        )
        recording.analyze()
        print(recording.detections)
        
        return recording.detections
        


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
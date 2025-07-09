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
    
    def __init__(self, config, detection_logger):
        self.lat = config.get("lat", None)
        self.lon = config.get("lon", None)
        self.min_conf = config.get("min_conf", 0.25)
        
        self.birdnet_analyzer = BirdnetAnalyzer()  
        self.analysis_queue = queue.Queue()
        self.segments_dir = Path(config.get("segments_dir", "pi/data/segments")).resolve()
        self.detection_logger = detection_logger
        
        self.running = False


    def analyse_segment(self, filename, audio_metadata):
        """Analyses a single audio segment file and logs any detections.
        
        Args:
            filename (str): Name of the audio segment file to analyze.
        """

        filepath = self.segments_dir / f"{filename}.wav"
        recording = Recording(
            self.birdnet_analyzer,
            str(filepath),
            lat=self.lat,
            lon=self.lon,
            date=datetime.strptime(filename, "%Y%m%d_%H%M%S_%f"),
            min_conf=self.min_conf
        )
        recording.analyze()
        print(recording.detections)
        
        
        # Log each detection found in the recording
        for detection in recording.detections:
            self._log_detection(filename, detection, audio_metadata)
            self._post_detection(detection, audio_metadata)
            


    def _log_detection(self, filename, detection, audio_metadata):
        """Logs a detection to the detection logger.
        
        Args:
            filename (str): Name of the audio segment file.
            detection (dict): Detection data to log.
        """
        
        self.detection_logger.log(filename, detection, audio_metadata)
        
        
    def _post_detection(self, detection, audio_metadata):
        """Posts a detection to the remote database API.
        
        Args:
            detection (dict): Detection data to post.
            audio_metadata (dict): Metadata about the audio segment.
        """
        
        self.detection_logger.post_detection(detection, audio_metadata)
        


    def add_segment(self, filename, audio_metdata):
        """Adds a segment filename to the analysis queue.
        Args:
            filename (str): Name of the audio segment file to add to the queue.
        """
        
        self.analysis_queue.put((filename, audio_metdata))
        print(f"Segment {filename} added to analysis queue.")

    def start(self):
        """Continuously processes segments from the analysis queue.
        
        Args:
            None
        
        Atributes:
            running (bool): Flag to indicate if the analyser is currently running.
        """
        
        self.running = True
        while self.running:
            try:
                filename, audio_metadata = self.analysis_queue.get(timeout=1)
                self.analyse_segment(filename, audio_metadata)
                self.analysis_queue.task_done()
            except queue.Empty:
                continue

    def stop(self):
        """Stops the analyser from processing segments.
        Args:
            None
        Atributes:
            running (bool): Flag to indicate if the analyser is currently running.
        """
        self.running = False
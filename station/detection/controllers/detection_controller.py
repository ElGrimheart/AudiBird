import os
import threading
import time
from detection.audio_capture import AudioCapture, Segmenter, SegmentHandler
from detection.analyser import Analyser, DetectionLogger
from detection.services import upload_detection, DetectionAggregator

class DetectionController:
    """DetectionController class to manage audio capture, analysis, and detection logging.

    This class is responsible for coordinating the various components involved in the detection process,
    including audio capture, segmentation, analysis, and logging of detection events.
    """
    
    
    def __init__(self, static_config, station_config):
        """Initialize the DetectionController with static and station configurations."""
        print(f"DetectionController created----------------------: {id(self)}")
        self._static_config = static_config
        self._station_config = station_config
        
        self._audio_capture = None
        self._analyser = None
        self._detection_aggregator = None
        self._detection_aggregator_queue = []
        self._last_detected_species = None
        self._last_detection_time = None
        self._inactivity_timeout = self._static_config["audio_capture"]["inactivity_timeout"]

        self._threads = []
        self._lock = threading.Lock()
        self._running = False
        
        
    def start(self):
        """Start the detection process."""
        with self._lock:
            if self._running:
                return False

            # Load configurations
            configs = self._build_configs()

            # Initialize components
            self._segmenter = Segmenter(configs["segmenter_config"])
            self._segment_handler = SegmentHandler(configs["segment_handler_config"])
            self._detection_logger = DetectionLogger(configs["detection_logger_config"])
            self._analyser = Analyser(configs["analyser_config"])
            self._detection_aggregator = DetectionAggregator(configs["detection_aggregator_config"])
                
            self._audio_capture = AudioCapture(
                configs["audio_capture_config"], 
                segmenter=self._segmenter, 
                segment_handler=self._segment_handler, 
                on_segment_ready=self._on_segment_ready
            )

            # Start analyser and audio capture threads
            analyser_thread = threading.Thread(target=self._analyser.start, daemon=True, name=f"AnalyserThread {id(self)}")
            analyser_thread.start()
            self._threads.append(analyser_thread)

            audio_capture_thread = threading.Thread(target=self._audio_capture.start, daemon=True, name=f"AudioCaptureThread {id(self)}")
            audio_capture_thread.start()
            self._threads.append(audio_capture_thread)
            
            self._running = True
            return True

    
    def _on_segment_ready(self, filename):
        """Callback function for handling the segment ready event. 
        Passes segment to the analyser and receives detection results.
        Tracks the last detection time and species.
        Accumulates successive detections of the same species into a queue before being passed to the aggregator.
        If no detections are recorded within the inactivity timeout period, any detections in the queue are passed to the aggregator.
        If the detected species changes, any detections in the queue are passed to the aggregator.
        Queue and state are reset following any species change or period of inactivity.
        """

        # Check for inactivity timeout. If inactive, process current detections and clear queue
        now = time.time()
        inactivity = (self._last_detection_time is not None and
                    now - self._last_detection_time > self._inactivity_timeout)
        if inactivity:
            self._process_aggregated_detections()


        # Analyze next segment
        detection = self._analyser.analyse_segment(filename)
        if not detection:
            self._segment_handler.delete_segment(f"{filename}.wav")
            return
        new_primary_species = detection["common_name"]

        # If primary species changes, aggregate current detections and clear the queue/state
        species_change = (self._last_detected_species is not None and new_primary_species != self._last_detected_species)
        if species_change:      
            self._process_aggregated_detections()
            self._detection_aggregator_queue = []
            self._last_detected_species = None
            self._last_detection_time = None

        # Otherwise, append the new detection to current queue and update state
        self._detection_aggregator_queue.append(detection)
        self._last_detected_species = new_primary_species
        self._last_detection_time = now
        

    def _process_aggregated_detections(self, configs=None):
        """Dispatches any detections in the queue to the aggregator and receives the processed results.
        Processed results are handled by the detection logger and uploader.
        """
        if self._detection_aggregator_queue:
            if configs is None:
                configs = self._build_configs()
            aggregated_detections = self._detection_aggregator.aggregate(self._detection_aggregator_queue)
            for detection_event in aggregated_detections:
                self._detection_logger.log(detection_event)
                response = upload_detection(
                    detection_event["recording_filename"], detection_event,
                    configs["detection_uploader_config"],
                    configs["station_metadata"],
                    configs["audio_metadata"],
                    configs["processing_metadata"]
                )
                
                for segment_file in detection_event.get("segment_filenames", []):
                    self._segment_handler.delete_segment(segment_file)
            self._detection_aggregator_queue.clear()
            self._last_detected_species = None


    def stop(self):
        """Stop the detection controller including all its components and threads"""
        print("Stopping detection controller...")
        with self._lock:
            if not self._running:
                return False

            try:
                if self._detection_aggregator_queue:
                    self._process_aggregated_detections()
                if self._audio_capture:
                    self._audio_capture.stop()
                if self._analyser:
                    self._analyser.stop()

                for thread in self._threads:
                    if thread.is_alive():
                        thread.join(timeout=5)
                self._threads.clear()
                
                self._running = False
            finally:
                self._running = False
                print("Detection controller stopped.")
            return True


    def is_running(self):
        """Checks if the detection controller is running.

        Returns:
            bool: True if the detection controller is running, False otherwise.
        """
        with self._lock:
            return self._running


    def _build_configs(self):
            """Builds configuration dictionaries for the various components used in the detection pipeline."""
            station_metadata = {
                "station_name": self._station_config["station"]["station_name"],
                "lat": self._station_config["station"]["location"]["lat"],
                "lon": self._station_config["station"]["location"]["lon"],
                "description": self._station_config["station"]["location"]["desc"]
            }

            audio_metadata = {
                "format": self._static_config["audio_capture"]["audio_format"],
                "channels": self._static_config["audio_capture"]["channels"],
                "sample_rate": self._static_config["audio_capture"]["sample_rate"],
                "dtype": self._static_config["audio_capture"]["dtype"]
            }

            processing_metadata = {
                "model_name": self._static_config["birdnet"]["model"] + " " + self._static_config["birdnet"]["version"],
                "sensitivity": self._static_config["birdnet"]["sensitivity"],
                "min_confidence": self._station_config["detection_config"]["min_confidence"],
                "segment_duration": self._static_config["segmenter_config"]["segment_duration"],
                "segment_overlap": self._static_config["segmenter_config"]["segment_overlap"]
            }
                
            audio_capture_config = {
                "sample_rate": self._static_config["audio_capture"]["sample_rate"],
                "channels": self._static_config["audio_capture"]["channels"],
                "dtype": self._static_config["audio_capture"]["dtype"],
            }

            segmenter_config = {
                "sample_rate": self._static_config["audio_capture"]["sample_rate"],
                "segment_duration": self._static_config["segmenter_config"]["segment_duration"],
                "segment_overlap": self._static_config["segmenter_config"]["segment_overlap"],
                "dtype": self._static_config["audio_capture"]["dtype"],
            }

            segment_handler_config = {
                "segments_dir": self._static_config["paths"]["segments_dir"],
                "sample_rate": self._static_config["audio_capture"]["sample_rate"]
            }

            analyser_config = {
                "segments_dir": self._static_config["paths"]["segments_dir"],
                "lat": self._station_config["station"]["location"]["lat"],
                "lon": self._station_config["station"]["location"]["lon"],
                "analyser_min_confidence": self._static_config["birdnet"]["analyser_min_confidence"],
                "sensitivity": self._static_config["birdnet"]["sensitivity"],
                "user_min_confidence": self._station_config["detection_config"]["min_confidence"]
            }

            detection_aggregator_config = {
                "output_dir": self._static_config["paths"]["recordings_dir"],
                "sample_rate": self._static_config["audio_capture"]["sample_rate"],
                "segment_overlap": self._static_config["segmenter_config"]["segment_overlap"]
            }

            detection_logger_config = {
                "detections_log": self._static_config["paths"]["detections_log"],
                "station_metadata": station_metadata,
                "audio_metadata": audio_metadata,
                "processing_metadata": processing_metadata
            }
            
            detection_uploader_config = {
                "station_id": self._station_config["station"]["id"],
                "station_api_key": self._station_config["station"]["api_key"],
            }
            
            return {
                "station_metadata": station_metadata,
                "audio_metadata": audio_metadata,
                "processing_metadata": processing_metadata,
                "audio_capture_config": audio_capture_config,
                "segmenter_config": segmenter_config,
                "segment_handler_config": segment_handler_config,
                "analyser_config": analyser_config,
                "detection_aggregator_config": detection_aggregator_config,
                "detection_logger_config": detection_logger_config,
                "detection_uploader_config": detection_uploader_config
            }
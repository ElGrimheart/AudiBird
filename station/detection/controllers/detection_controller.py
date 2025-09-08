# Main entry point for the detection pipeline - orchestrates audio capture, analysis, and detection logging
import threading
import time
from detection.audio_capture import AudioCapture, Segmenter, SegmentHandler
from detection.analyser import Analyser, DetectionLogger
from detection.services import upload_detection, DetectionAggregator
import logging

logger = logging.getLogger(__name__)

class DetectionController:
    """
    DetectionController class to orchestrate audio capture, analysis, and detection logging.

    This class is responsible for coordinating the various components involved in the detection
    pipeline, including audio capture, segmentation, analysis, aggregating and logging detection 
    events.

    Calling the start() method instantiates the components required and launches the detection
    process.

    The audio capture and analyser components are launched in separate threads to allow concurrent 
    processing of the continuous audio stream and analysis of the captured audio.
    
    A callback function is passed to the AudioCapture component which handles the ready event
    for each audio segment. Once an audio segment is ready, it is passed to the analyser for
    processing.

    The analyser returns the detection result of each segment analysed, which are stored in a
    temporary queue to allow subsequent detections of the same species to be aggregated into
    one event. The last detected species and last detection time are monitored to appropriately
    group detections, or to trigger a new event if either; the species changes, or if the 
    inactivity timeout period is reached.

    Grouped detections are then passed to the detection aggregator to be merged into a single
    event and audio file, before being uploaded to the backend.

    Attributes:
        _static_config (dict): Static configuration settings.
        _station_config (dict): Station-specific configuration settings.
        _audio_capture (AudioCapture): Audio capture component.
        _segmenter (Segmenter): Audio segmentation component.
        _segment_handler (SegmentHandler): Audio segment handling component.
        _analyser (Analyser): Audio analysis component.
        _detection_logger (DetectionLogger): Detection logging component.
        _detection_aggregator (DetectionAggregator): Detection aggregation component.
        _detection_aggregator_queue (list): Queue for holding detection events.
        _last_detected_species (str): Last detected species.
        _last_detection_time (float): Last detection timestamp.
        _inactivity_timeout (float): Inactivity timeout duration.
        _threads (list): List of active threads.
        _lock (threading.Lock): Thread lock for synchronization.
        _running (bool): Flag indicating if the detection process is running.
        
    Methods:
        start: Start the detection process.
        stop: Stop the detection process.
    """
    
    def __init__(self, static_config, station_config):
        """
        Initialize the DetectionController with static and station configurations.
        
        Args:
            static_config (dict): Static configuration settings.
            station_config (dict): Station-specific configuration settings.
            
        Raises:
            TypeError: If static_config or station_config is not a dictionary.
        """
        if not isinstance(static_config, dict):
            logger.error("static_config must be a dictionary")
            raise TypeError("static_config must be a dictionary")
        if not isinstance(station_config, dict):
            logger.error("station_config must be a dictionary")
            raise TypeError("station_config must be a dictionary")
        
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
        
        logger.info(f"DetectionController created {id(self)}")
        
        
    def start(self):
        """
        Starts the detection process.

        Launches the audio capture and analyser components in separate threads to allow concurrent
        processing of the continuous audio stream and analysis of the captured audio.

        Utilises the _on_segment_ready callback function which is passed to the AudioCapture component 
        to monitor the ready event for each audio segment. 
        
        Once an audio segment is ready, it is passed to the analyser for processing.

        Raises:
            RuntimeError: If the detection process fails to start.
        """
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
            
            
            try:
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
            except Exception as e:
                logger.error(f"Error initializing audio capture: {e}")
                self.stop()
                raise
            
    
    def _on_segment_ready(self, filename):
        """
        Callback function for handling the audio segment ready event.
        Passes segments to the analyser and receives the detection results.

        Adds successive detections of the same species into the detection_aggregator_queue.
        
        If the detected species changes or if the inactivity timeout period is reached, any 
        detections in the queue are passed to the aggregator.
        
        Queue and state are reset following any species change or period of inactivity.
        
        Args:
            filename (str): The name of the audio segment file.
        """

        # Check for inactivity timeout. If inactive, process current detections and clear queue
        now = time.time()
        inactivity = (self._last_detection_time is not None and
                    now - self._last_detection_time > self._inactivity_timeout)
        if inactivity:
            self._process_aggregated_detections()


        # Analyze next segment (delete segment and continue if analysis fails)
        try:  
            detection = self._analyser.analyse_segment(filename, top_n=5)
        except Exception as e:
            logger.error(f"Error analysing segment {filename}: {e}")
            self._segment_handler.delete_segment(f"{filename}.wav")  
            return
        
        
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
        """
        Dispatches any detections in the queue to the aggregator and receives the processed results.
        
        Passes the aggregated event to the detection_logger and detection_uploader.
        
        Finally, deletes the redundant audio segment files using the segment handler and clears
        the detection queue and state.
        """
        if self._detection_aggregator_queue:
            if configs is None:
                configs = self._build_configs()
            
            try:
                # Aggregate detections
                aggregated_detections = self._detection_aggregator.aggregate(self._detection_aggregator_queue)
                for detection_event in aggregated_detections:
                    try:
                        # Log and upload detection event
                        self._detection_logger.log(detection_event)
                        response = upload_detection(
                            detection_event["recording_filename"], 
                            detection_event,
                            configs["detection_uploader_config"],
                            configs["station_metadata"],
                            configs["audio_metadata"],
                            configs["processing_metadata"]
                        )
                    except Exception as e:
                        logger.error(f"Error uploading detection {detection_event['id']}: {e}")

                    # Delete redundant audio segments
                    for segment_file in detection_event.get("segment_filenames", []):
                        try: 
                            self._segment_handler.delete_segment(segment_file)
                        except Exception as e:
                            logger.error(f"Error deleting segment {segment_file}: {e}")
            except Exception as e:
                logger.error(f"Error processing aggregated detections: {e}")
            finally:
                self._detection_aggregator_queue.clear()
                self._last_detected_species = None


    def _build_configs(self):
        """
        Constructs the configuration dictionaries for the various components used in the 
        detection pipeline.
        
        Returns:
            dict: A dictionary containing the configuration for the various components:
            - station_metadata
            - audio_metadata
            - processing_metadata
            - audio_capture_config
            - segmenter_config
            - segment_handler_config
            - analyser_config
            - detection_aggregator_config
            - detection_logger_config
            
        Raises:
            KeyError: If any required configuration key is missing.
        """
        
        try:
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
        except KeyError as e:
            logger.error(f"Missing configuration key: {e}")
            raise
        
        
    def stop(self):
        """
        Stops the detection controller including all its components and threads.
        """
        logger.info("Stopping detection controller...")
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
                logger.info("Detection controller stopped.")
            return True


    def is_running(self):
        """
        Checks if the detection controller is running.

        Returns:
            bool: True if the detection controller is running, False otherwise.
        """
        with self._lock:
            return self._running
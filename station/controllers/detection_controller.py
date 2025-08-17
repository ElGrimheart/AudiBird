import os
import threading
from audio_capture import AudioCapture, WebSocketStream, Segmenter, SegmentSaver
from analysis import Analyser, DetectionLogger
from services import upload_detection

class DetectionController:
    def __init__(self, static_config, station_config):
        print(f"DetectionController created----------------------: {id(self)}")
        self._static_config = static_config
        self._station_config = station_config
        self._lock = threading.Lock()
        self._running = False
        self._audio_capture = None
        self._analyser = None
        self._websocket_stream = None
        self._threads = []
        
    def _build_configs(self):
        """Builds configuration dictionaries for various components."""
        station_metadata = {
            "station_name": self._station_config["station"]["station_name"],
            "lat": self._station_config["station"]["location"]["lat"],
            "lon": self._station_config["station"]["location"]["lon"],
            "description": self._station_config["station"]["location"]["desc"]
        }

        audio_metadata = {
            "duration": self._static_config["segmenter_config"]["segment_duration"],
            "channels": self._static_config["audio_capture"]["channels"],
            "sample_rate": self._static_config["audio_capture"]["sample_rate"],
            "sample_width": self._static_config["segmenter_config"]["sample_width"],
            "dtype": self._static_config["audio_capture"]["dtype"]
        }

        processing_metadata = {
            "model_name": self._static_config["birdnet"]["model"] + " " + self._static_config["birdnet"]["version"],
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
            "segment_overlap": self._static_config["segmenter_config"]["segment_overlap"]
        }

        segment_saver_config = {
            "segments_dir": self._static_config["paths"]["segments_dir"],
            "sample_rate": self._static_config["audio_capture"]["sample_rate"],
            "channels": self._static_config["audio_capture"]["channels"],
            "sample_width": self._static_config["segmenter_config"]["sample_width"]
        }

        analyser_config = {
            "segments_dir": self._static_config["paths"]["segments_dir"],
            "lat": self._station_config["station"]["location"]["lat"],
            "lon": self._station_config["station"]["location"]["lon"],
            "min_conf": self._station_config["detection_config"]["min_confidence"]
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
            "segment_saver_config": segment_saver_config,
            "analyser_config": analyser_config,
            "detection_logger_config": detection_logger_config,
            "detection_uploader_config": detection_uploader_config
        }
        
    def start(self):
        with self._lock:
            if self._running:
                return False

            # Load configurations
            configs = self._build_configs()

            # Initialize components
            self._segmenter = Segmenter(configs["segmenter_config"])
            self._segment_saver = SegmentSaver(configs["segment_saver_config"])
            self._websocket_stream = WebSocketStream(os.environ.get("API_WEBSOCKET_URL"))
            self._detection_logger = DetectionLogger(configs["detection_logger_config"])
            self._analyser = Analyser(configs["analyser_config"])

            def on_segment_ready(filename):
                detections = self._analyser.analyse_segment(filename)

                if not detections:
                    self._segment_saver.delete_segment(filename)
                for detection in detections:
                    self._detection_logger.log(filename, detection)
                    upload_detection(filename, detection, configs["detection_uploader_config"], configs["station_metadata"], configs["audio_metadata"], configs["processing_metadata"])

            self._audio_capture = AudioCapture(
                configs["audio_capture_config"], 
                segmenter=self._segmenter, 
                segment_saver=self._segment_saver, 
                on_segment_ready=on_segment_ready
            )

            # Add WebSocket stream as audio listener
            self._audio_capture.add_listener(self._websocket_stream.send_audio)

            # Start analyser and audio capture threads
            analyser_thread = threading.Thread(
                target=self._analyser.start, 
                daemon=True,
                name=f"AnalyserThread {id(self)}"
            )
            analyser_thread.start()
            self._threads.append(analyser_thread)

            audio_capture_thread = threading.Thread(
                target=self._audio_capture.start, 
                daemon=True,
                name=f"AudioCaptureThread {id(self)}"
            )
            audio_capture_thread.start()
            self._threads.append(audio_capture_thread)
            
            self._running = True
            return True

    def stop(self):
        """Stop the detection controller including all its components."""
        with self._lock:
            if not self._running:
                return False

            try:
                if self._audio_capture:
                    self._audio_capture.stop()
                if self._websocket_stream:
                    self._websocket_stream.close()
                if self._analyser:
                    self._analyser.stop()

                for thread in self._threads:
                    if thread.is_alive():
                        thread.join(timeout=5)
                self._threads.clear()
                
                self._running = False
            finally:
                self._running = False
            return True

    def is_running(self):
        """Check if the detection controller is running."""
        with self._lock:
            return self._running

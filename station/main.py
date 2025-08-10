## Main entry point for the Pi application
import os
import signal
import sys
from pathlib import Path
import threading
from utils.config_loader import load_yaml_config
from audio_capture import AudioCapture, WebSocketStream, Segmenter, SegmentSaver
from analysis import Analyser, DetectionLogger
from services.upload_detection import upload_detection
from server import AudioServer

# Load configurations
STATIC_CONFIG = load_yaml_config('config/static_config.yaml')
STATION_CONFIG = load_yaml_config('config/station_config.yaml')

station_metadata = {
    "station_name": STATION_CONFIG["station"]["station_name"],
    "lat": STATION_CONFIG["station"]["location"]["lat"],
    "lon": STATION_CONFIG["station"]["location"]["lon"],
    "description": STATION_CONFIG["station"]["location"]["desc"]
}

audio_metadata = {
    "duration": STATION_CONFIG["detection_config"]["segment_duration"],
    "channels": STATIC_CONFIG["audio_capture"]["channels"],
    "sample_rate": STATIC_CONFIG["audio_capture"]["sample_rate"],
    "sample_width": STATIC_CONFIG["audio_capture"]["sample_width"],
    "dtype": STATIC_CONFIG["audio_capture"]["dtype"]
}

processing_metadata = {
    "model_name": STATIC_CONFIG["birdnet"]["model"] + " " + STATIC_CONFIG["birdnet"]["version"],
    "min_confidence": STATION_CONFIG["detection_config"]["min_confidence"],
    "segment_duration": STATION_CONFIG["detection_config"]["segment_duration"],
    "segment_overlap": STATION_CONFIG["detection_config"]["segment_overlap"]
}
    
audio_capture_config = {
    "sample_rate": STATIC_CONFIG["audio_capture"]["sample_rate"],
    "channels": STATIC_CONFIG["audio_capture"]["channels"],
    "dtype": STATIC_CONFIG["audio_capture"]["dtype"],        
}

segmenter_config = {
    "sample_rate": STATIC_CONFIG["audio_capture"]["sample_rate"],
    "segment_duration": STATION_CONFIG["detection_config"]["segment_duration"],
    "segment_overlap": STATION_CONFIG["detection_config"]["segment_overlap"]
}

segment_saver_config = {
    "segments_dir": STATIC_CONFIG["paths"]["segments_dir"],
    "sample_rate": STATIC_CONFIG["audio_capture"]["sample_rate"],
    "channels": STATIC_CONFIG["audio_capture"]["channels"],
    "sample_width": STATIC_CONFIG["audio_capture"]["sample_width"]
}

analyser_config = {
    "segments_dir": STATIC_CONFIG["paths"]["segments_dir"],
    "lat": STATION_CONFIG["station"]["location"]["lat"],
    "lon": STATION_CONFIG["station"]["location"]["lon"],
    "min_conf": STATION_CONFIG["detection_config"]["min_confidence"]
}

detection_logger_config = {
    "detections_log": STATIC_CONFIG["paths"]["detections_log"],
    "station_metadata": station_metadata,
    "audio_metadata": audio_metadata,
    "processing_metadata": processing_metadata
}


if __name__ == "__main__":
    # Initialize components
    segmenter = Segmenter(segmenter_config)
    segment_saver = SegmentSaver(segment_saver_config)
    websocket_stream = WebSocketStream(os.environ.get("API_WEBSOCKET_URL"))
    detection_logger = DetectionLogger(detection_logger_config)
    analyser = Analyser(analyser_config)
    
    
    # Signal handler for graceful shutdown
    def handle_sigterm(signum, frame):
        print("Stopping detection...")
        audio_capture.stop()
        sys.exit(0)

    signal.signal(signal.SIGTERM, handle_sigterm)


    # Callback function - handles when a segment is ready for analysis
    def on_segment_ready(filename):
        detections = analyser.analyse_segment(filename)
        if detections == []:
            segment_saver.delete_segment(filename)
        for detection in detections:
            detection_logger.log(filename, detection)
            upload_detection(filename, detection, station_metadata, audio_metadata, processing_metadata)
    
    audio_capture = AudioCapture(
        audio_capture_config,
        segmenter=segmenter,
        segment_saver=segment_saver,
        on_segment_ready=on_segment_ready
    )
    
    # Adding websocket stream as a listener to the audio capture component
    audio_capture.add_listener(websocket_stream.send_audio)
    
    # Start analyser in separate thread
    threading.Thread(target=analyser.start, daemon=True).start()
    
    # Start audio capture
    audio_capture.start() 

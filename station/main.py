## Main entry point for the Pi application
import yaml
from pathlib import Path
import threading
from utils.config_loader import load_yaml_config
from audio_capture import AudioCapture, WebSocketStream, Segmenter, SegmentSaver
from analysis import Analyser, DetectionLogger
from services.upload_detection import upload_detection
from server import AudioServer


if __name__ == "__main__":
    
    local_config = load_yaml_config('config/local_config.yaml')
    remote_config = load_yaml_config('config/remote_config.yaml')
    
    station_metadata = {
        "station_name": remote_config["station"]["station_name"],
        "lat": remote_config["station"]["location"]["lat"],
        "lon": remote_config["station"]["location"]["lon"],
        "description": remote_config["station"]["location"]["desc"]
    }
    
    audio_metadata = {
        "duration": remote_config["detection_config"]["segment_duration"],
        "channels": local_config["audio_capture"]["channels"],
        "sample_rate": local_config["audio_capture"]["sample_rate"],
        "sample_width": local_config["audio_capture"]["sample_width"],
        "dtype": local_config["audio_capture"]["dtype"]
    }
    
    processing_metadata = {
        "model_name": local_config["birdnet"]["model"] + " " + local_config["birdnet"]["version"],
        "min_confidence": remote_config["detection_config"]["min_confidence"],
        "segment_duration": remote_config["detection_config"]["segment_duration"],
        "segment_overlap": remote_config["detection_config"]["segment_overlap"]
    }
        
    audio_capture_config = {
        "sample_rate": local_config["audio_capture"]["sample_rate"],
        "channels": local_config["audio_capture"]["channels"],
        "dtype": local_config["audio_capture"]["dtype"],        
    }

    segmenter_config = {
        "sample_rate": local_config["audio_capture"]["sample_rate"],
        "segment_duration": remote_config["detection_config"]["segment_duration"],
        "segment_overlap": remote_config["detection_config"]["segment_overlap"]
    }

    segment_saver_config = {
        "segments_dir": local_config["paths"]["segments_dir"],
        "sample_rate": local_config["audio_capture"]["sample_rate"],
        "channels": local_config["audio_capture"]["channels"],
        "sample_width": local_config["audio_capture"]["sample_width"]
    }
    
    analyser_config = {
        "segments_dir": local_config["paths"]["segments_dir"],
        "lat": remote_config["station"]["location"]["lat"],
        "lon": remote_config["station"]["location"]["lon"],
        "min_conf": remote_config["detection_config"]["min_confidence"]
    }
    
    detection_logger_config = {
        "detections_log": local_config["paths"]["detections_log"],
        "station_metadata": station_metadata,
        "audio_metadata": audio_metadata,
        "processing_metadata": processing_metadata
    }
    
    server_config = {
        "host": local_config["flask_server"]["host"],
        "port": local_config["flask_server"]["port"],
        "recordings_dir": local_config["paths"]["segments_dir"]
    }
    
    # Initialize components
    segmenter = Segmenter(segmenter_config)
    segment_saver = SegmentSaver(segment_saver_config)
    websocket_stream = WebSocketStream(local_config["websocket_stream"]["url"])
    detection_logger = DetectionLogger(detection_logger_config)
    analyser = Analyser(analyser_config)
    server = AudioServer(server_config)

    # Start the server in separate thread
    threading.Thread(target=server.start, daemon=True).start()

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

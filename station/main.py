## Main entry point for the Pi application
import yaml
from pathlib import Path
import threading
from audio_capture import AudioCapture, LiveStream, Segmenter, SegmentSaver
from analysis import Analyser, DetectionLogger
from utils.config_loader import load_yaml_config

if __name__ == "__main__":
    
    local_config = load_yaml_config('config/local_config.yaml')
    remote_config = load_yaml_config('config/remote_config.yaml')
        
        
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
    
    livestream_config = {
        "sample_rate": local_config["audio_capture"]["sample_rate"],
        "channels": local_config["audio_capture"]["channels"],
        "dtype": local_config["audio_capture"]["dtype"],
        "output_device": local_config["livestream"]["output_device"]
    }
    
    analyser_config = {
        "segments_dir": local_config["paths"]["segments_dir"],
        "lat": remote_config["station"]["location"]["lat"],
        "lon": remote_config["station"]["location"]["lon"],
        "min_conf": remote_config["detection_config"]["min_confidence"],
        "detections_log": local_config["paths"]["detections_log"],
        "api_url": local_config["db_api"]["url"],
        "api_key": local_config["db_api"]["api_key"],
        "post_detection_route": local_config["db_api"]["routes"]["post_detection"]
    }
    
    segmenter = Segmenter(segmenter_config)
    segment_saver = SegmentSaver(segment_saver_config)
    livestream = LiveStream(livestream_config)
    detection_logger = DetectionLogger(local_config["paths"]["detections_log"])
    analyser = Analyser(analyser_config, detection_logger)
    
    
    # Callback function to handle when a segment is ready for analysis
    def on_segment_ready(filename, audio_metadata, processing_metadata):
        analyser.add_segment(filename, audio_metadata, processing_metadata)
    
    audio_capture = AudioCapture(
        audio_capture_config,
        segmenter=segmenter,
        segment_saver=segment_saver,
        on_segment_ready=on_segment_ready
    )
    
    
    """
    livestream.start()  # Start livestream audio playback
    audio_capture.add_listener(livestream.play_audio)  # Add livestream as a listener to audio capture
    """
    
    # Starting analyser in separate thread
    threading.Thread(target=analyser.start, daemon=True).start()
    
    # Start audio capture
    audio_capture.start() 

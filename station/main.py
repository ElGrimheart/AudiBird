## Main entry point for the Pi application
import yaml
from pathlib import Path
import threading
from audio_capture import AudioCapture, LiveStream, Segmenter, SegmentSaver
from analysis import Analyser, DetectionLogger

if __name__ == "__main__":
    
    ## Loading configuration from YAML file and initializing components
    config_path = Path(__file__).parent / "config" / "audio.yaml"
    with open(config_path, "r") as f:
        main_config = yaml.safe_load(f)
        
        
    audio_capture_config = {
        "sample_rate": main_config["audio_capture"]["sample_rate"],
        "channels": main_config["audio_capture"]["channels"],
        "dtype": main_config["audio_capture"]["dtype"],        
    }

    segmenter_config = {
        "sample_rate": main_config["audio_capture"]["sample_rate"],
        "segment_duration": main_config["segments"]["duration"],
        "segment_overlap": main_config["segments"]["overlap"]
    }

    segment_saver_config = {
        "segments_dir": main_config["paths"]["segments_dir"],
        "sample_rate": main_config["audio_capture"]["sample_rate"],
        "channels": main_config["audio_capture"]["channels"],
        "sample_width": main_config["segments"]["sample_width"]
    }
    
    livestream_config = {
        "sample_rate": main_config["audio_capture"]["sample_rate"],
        "channels": main_config["audio_capture"]["channels"],
        "dtype": main_config["audio_capture"]["dtype"],
        "output_device": main_config["livestream"]["output_device"]
    }
    
    analyser_config = {
        "segments_dir": main_config["paths"]["segments_dir"],
        "lat": main_config["station"]["lat"],
        "lon": main_config["station"]["lon"],
        "min_conf": main_config["birdnet"]["min_confidence"],
        "detections_log": main_config["paths"]["detections_log"]
    }
    
    segmenter = Segmenter(segmenter_config)
    segment_saver = SegmentSaver(segment_saver_config)
    livestream = LiveStream(livestream_config)
    detection_logger = DetectionLogger(main_config["paths"]["detections_log"])
    analyser = Analyser(analyser_config, detection_logger)
    
    
    # Callback function to handle when a segment is ready for analysis
    def on_segment_ready(filename):
        analyser.add_segment(filename)
    
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

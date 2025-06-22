## Main entry point for the Pi application
import audio_capture as ac
import time

def main():
    """Main function to run the audio capture application."""
    
    # Initialize audio capture with desired parameters
    sample_rate = 48000  # Sample rate in Hz
    channels = 1         # Number of audio channels (1 for mono, 2 for stereo)
    segment_duration = 5 # Duration of each audio segment in seconds
    
    # Create an instance of AudioCapture
    audio_capture = ac.AudioCapture(sample_rate, channels, segment_duration)
    
    # Start capturing audio
    audio_capture.start()
    
    
if __name__ == "__main__":
    main()

"""Handles audio segmentation for incoming audio data."""
import numpy as np

class Segmenter:
    """Handles audio segmentation for incoming audio data.
    
    Args:
        config (dict): Configuration parameters for audio segmentation.
        
    Methods:
        append_audio(audio_data): Appends incoming audio data to the buffer.
        get_segments(): Extracts segments from the audio buffer based on the specified duration and overlap.
    """
        
        
    def __init__ (self, config):
        """ Initializes the Segmenter with configuration parameters.

        Args:
            config (dict): Configuration parameters for audio segmentation
        
        Attributes:
            sample_rate (int): Sample rate of the audio. Default is 48000 Hz.
            segment_duration (int): Duration of each audio segment in seconds. Default is 60 seconds.
            overlap (int): Overlap between segments in seconds. Default is 0 seconds.
            samples_per_segment (int): Number of samples per segment based on sample rate and duration.
            samples_overlap (int): Number of samples for overlap based on sample rate and overlap duration.
            audio_buffer (list): Buffer to hold incoming audio data.
        """
        self.sample_rate = config.get("sample_rate", 48000)
        self.segment_duration = config.get("segment_duration", 60)
        self.overlap = config.get("segment_overlap", 0)
        self.samples_per_segment = int(self.sample_rate * self.segment_duration)
        self.samples_overlap = int(self.sample_rate * self.overlap)
        
        self.audio_buffer = []  # Buffer to hold incoming audio data


    def append_audio(self, audio_data):
        """Appends incoming audio data to the buffer.

        Args:
            audio_data (numpy.ndarray): Audio data to be appended, expected to be a numpy array or similar structure.
        """
        
        self.audio_buffer.extend(audio_data.flatten())      # Flatten the audio data to a 1D list
    
    
    def get_segments(self):
        """Extracts segments from the audio buffer based on the specified duration and overlap.
        
        Returns:
            list: A list of audio segments, each segment is a numpy array of int16 type.
        """
        
        self.segments = []  # List to hold the segments extracted from the audio buffer
        
        # Extract segment from buffer once specified duration is reached
        while len(self.audio_buffer) >= self.samples_per_segment:
            segment = np.array(self.audio_buffer[:self.samples_per_segment], dtype=np.int16)
            self.segments.append(segment)
            
            # Reset the buffer but retain the overlap
            self.audio_buffer = self.audio_buffer[self.samples_per_segment - self.samples_overlap:]
        
        return self.segments
          
    
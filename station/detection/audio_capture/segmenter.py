"""Handles audio segmentation for incoming audio data from the mic stream."""
import numpy as np

class Segmenter:
    """_summary_
    Handles audio segmentation for incoming audio data from the mic stream.
    
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
        self._sample_rate = config.get("sample_rate", 48000)
        self._segment_duration = config.get("segment_duration", 3)
        self._segment_overlap = config.get("segment_overlap", 2)
        self._samples_per_segment = int(self._sample_rate * self._segment_duration)
        self._samples_overlap = int(self._sample_rate * self._segment_overlap)
        self._dtype = config.get("dtype", "int16")
        self._audio_buffer = [] 


    def append_audio(self, audio_data):
        """Appends incoming audio data to the buffer. Flattens the audio data to 1D.

        Args:
            audio_data (numpy.ndarray): Audio data to be appended, expected to be a numpy array or similar structure.
        """
        
        self._audio_buffer.extend(audio_data.flatten())  
    
    
    def get_segments(self):
        """Extracts segments from the audio buffer based on the duration and overlap specified in the configuration.

        Attributes:
            segments (list): A list to hold the extracted audio segments.

        Returns:
            list: A list of audio segments, each segment is a numpy array of int16 type.
        """
        
        self.segments = []
        
        # Extract segment from buffer once the specified duration is reached
        while len(self._audio_buffer) >= self._samples_per_segment:
            segment = np.array(self._audio_buffer[:self._samples_per_segment], dtype=self._dtype)
            self.segments.append(segment)

            # Reset the buffer but retain the overlap for the subsequent segment
            self._audio_buffer = self._audio_buffer[self._samples_per_segment - self._samples_overlap:]
        
        return self.segments
          
    
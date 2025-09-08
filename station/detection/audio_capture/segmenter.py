import numpy as np
import logging

logger = logging.getLogger(__name__)

class Segmenter:
    """_summary_
    Handles audio segmentation of audio data from the mic stream.
    
    Stores incoming audio data in a queue until the specified segment duration is reached. Once reached, 
    the audio data is extracted (while retaining any specified overlap) and can be retrieved for further
    processing/analysis.
    
    Attributes:
        _sample_rate (int): Sample rate of the audio. Defaults to 48000 if none provided.
        _segment_duration (int): Duration of each audio segment in seconds. Defaults to 3 if none provided.
        _overlap (int): Overlap between segments in seconds. Defaults to 2 if none provided.
        _dtype (str): Data type for audio samples. Defaults to "int16" if none provided.
        _samples_per_segment (int): Number of samples per segment based on sample rate and duration.
        _samples_overlap (int): Number of samples for overlap based on sample rate and overlap duration.
        _audio_buffer (list): Buffer to hold incoming audio data until it is segmented.

    Methods:
        append_audio(audio_data): Appends incoming audio data to the buffer.
        get_segments(): Extracts segments from the audio buffer based on the specified duration and overlap.
    """
    SAMPLE_RATE_DEFAULT = 48000
    DTYPE_DEFAULT = "int16"
    SEGMENT_DURATION_DEFAULT = 3
    SEGMENT_OVERLAP_DEFAULT = 2
    SUPPORTED_DTYPES = ("int16", "float32")
    
    SAMPLE_RATE_MIN = 8000
    SAMPLE_RATE_MAX = 192000
    SEGMENT_DURATION_MIN = 1
    SEGMENT_DURATION_MAX = 30
    SEGMENT_OVERLAP_MIN = 0
    SEGMENT_OVERLAP_MAX = 30


    def __init__ (self, config):
        """ Instantiates the Segmenter with the configuration parameters passed

        Args:
            config (dict): Configuration parameters for audio segmentation. Supported keys:
            - 'sample_rate' (int): Sample rate of the audio.
            - 'segment_duration' (int): Duration of each audio segment in seconds.
            - 'segment_overlap' (int): Overlap between segments in seconds.
            - 'dtype' (str): Data type for audio samples.
            
        Raises:
            TypeError:
            - If config is not a dictionary.
            - If any config parameter is of the wrong type.
            ValueError:
            - If any config parameter is out of range.
        """
        if not isinstance(config, dict):
            logger.error("Invalid config type")
            raise TypeError("config must be a dictionary")

        # Validate config parameters
        sample_rate = config.get("sample_rate", self.SAMPLE_RATE_DEFAULT)
        segment_duration = config.get("segment_duration", self.SEGMENT_DURATION_DEFAULT)
        segment_overlap = config.get("segment_overlap", self.SEGMENT_OVERLAP_DEFAULT)
        dtype = config.get("dtype", self.DTYPE_DEFAULT)

        if not isinstance(sample_rate, int):
            logger.error("Invalid sample_rate type. Sample rate must be an integer.")
            raise TypeError("sample_rate must be an integer")
        if not (self.SAMPLE_RATE_MIN <= sample_rate <= self.SAMPLE_RATE_MAX):
            logger.error("Invalid sample_rate value. sample_rate must be between {self.SAMPLE_RATE_MIN} and {self.SAMPLE_RATE_MAX}")
            raise ValueError(f"sample_rate must be between {self.SAMPLE_RATE_MIN} and {self.SAMPLE_RATE_MAX}")

        if not isinstance(segment_duration, int):
            logger.error("Invalid segment_duration type. segment_duration must be an integer.")
            raise TypeError("segment_duration must be an integer")
        if not (self.SEGMENT_DURATION_MIN <= segment_duration <= self.SEGMENT_DURATION_MAX):
            logger.error("Invalid segment_duration value. segment_duration must be between {self.SEGMENT_DURATION_MIN} and {self.SEGMENT_DURATION_MAX}")
            raise ValueError(f"segment_duration must be between {self.SEGMENT_DURATION_MIN} and {self.SEGMENT_DURATION_MAX}")

        if not isinstance(segment_overlap, int):
            logger.error("Invalid segment_overlap type. segment_overlap must be an integer.")
            raise TypeError("segment_overlap must be an integer")
        if not (self.SEGMENT_OVERLAP_MIN <= segment_overlap <= self.SEGMENT_OVERLAP_MAX):
            logger.error("Invalid segment_overlap value. segment_overlap must be between {self.SEGMENT_OVERLAP_MIN} and {self.SEGMENT_OVERLAP_MAX}")
            raise ValueError(f"segment_overlap must be between {self.SEGMENT_OVERLAP_MIN} and {self.SEGMENT_OVERLAP_MAX}")

        if segment_overlap >= segment_duration:
            logger.error("Invalid segment_overlap value. segment_overlap must be less than segment_duration")
            raise ValueError("segment_overlap must be less than segment_duration")

        if dtype not in self.SUPPORTED_DTYPES:
            logger.error(f"Invalid dtype value. dtype must be one of {self.SUPPORTED_DTYPES}")
            raise ValueError(f"dtype must be one of {self.SUPPORTED_DTYPES}")

        # Assign to instance variables
        self._sample_rate = sample_rate
        self._segment_duration = segment_duration
        self._segment_overlap = segment_overlap
        self._dtype = dtype
        self._samples_per_segment = int(self._sample_rate * self._segment_duration)
        self._samples_overlap = int(self._sample_rate * self._segment_overlap)
        self._audio_buffer = []
        
        logger.info(f"Segmenter initialized with sample_rate={self._sample_rate}, segment_duration={self._segment_duration}, segment_overlap={self._segment_overlap}, dtype={self._dtype}")

    def append_audio(self, audio_data):
        """Appends incoming audio data to the buffer. Flattens the audio data to 1D.

        Args:
            audio_data (numpy.ndarray): Audio data to be appended, expected to be a numpy array or similar structure.
        """
        if not isinstance(audio_data, np.ndarray):
            raise ValueError("audio_data must be a numpy array")

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
          
    
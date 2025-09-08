import os
from pathlib import Path
import soundfile as sf
import numpy as np
import logging

logger = logging.getLogger(__name__)

class SegmentHandler:
    """ Manages writing and deleting audio segments to and from disk.
    
    The SegmentHandler is used to handle the lifecycle of audio segments, including saving
    them to disk until they have been analysed/aggregated. 
    Also provides methods for safely deleting segments from disk once they are no longer required.

    Attributes:
        segments_dir (Path): Directory where audio segments will be saved. Defaults to "data/segments" if not provided.
        sample_rate (int): Sample rate of the audio. Defaults to 48000 if not provided.
    
    Methods:
        save(segment, filename): Saves an audio segment with the specified filename.
        delete(filename): Deletes an audio segment file.
    """
    SEGMENTS_DIR_DEFAULT = "data/segments"
    SAMPLE_RATE_DEFAULT = 48000
    
    SAMPLE_RATE_MIN = 8000
    SAMPLE_RATE_MAX = 192000
    FILENAME_CHARS_INVALID = r'<>:"/\|?*'
    SUPPORTED_DTYPES = ("int16", "float32")


    def __init__(self, config):
        """ Initializes the SegmentSaver with configuration parameters.

        Args:
            config (dict): Configuration parameters for handling audio segments.
            - segments_dir (str): Directory where audio segments will be saved.
            - sample_rate (int): Sample rate of the audio. 

        Raises:
            TypeError:
            - If config is not a dictionary.
            - If any config parameter is of the wrong type.
            ValueError:
            - If any config parameter is out of range.
        """
        if not isinstance(config, dict):
            raise ValueError("config must be a dictionary")
        
        segments_dir = Path(config.get("segments_dir", SegmentHandler.SEGMENTS_DIR_DEFAULT)).resolve()
        sample_rate = config.get("sample_rate", SegmentHandler.SAMPLE_RATE_DEFAULT)

        # Validate and create directory if needed
        if not segments_dir.exists():
            segments_dir.mkdir(parents=True, exist_ok=True)
        if not segments_dir.is_dir():
            logger.error(f"Invalid segments_dir. '{segments_dir}' is not a directory")
            raise ValueError(f"segments_dir '{segments_dir}' is not a directory")

        # Validate sample_rate
        if not isinstance(sample_rate, int):
            logger.error("Invalid sample_rate type. sample_rate must be an integer.")
            raise TypeError("sample_rate must be an integer")
        if not (self.SAMPLE_RATE_MIN <= sample_rate <= self.SAMPLE_RATE_MAX):
            logger.error(f"Invalid sample_rate value. sample_rate must be between {self.SAMPLE_RATE_MIN} and {self.SAMPLE_RATE_MAX}")
            raise ValueError(f"sample_rate must be between {self.SAMPLE_RATE_MIN} and {self.SAMPLE_RATE_MAX}")

        self._segments_dir = segments_dir
        self._sample_rate = sample_rate


    def save_segment(self, segment, filename):
        """Saves the passed audio segment to disk using the specified filename.

        Args:
            segment (numpy.ndarray): Audio segment to be saved, expected to be a numpy array
            filename (str): Name of the file to save the segment as, without extension.
            
        Raises:
            TypeError: If the segment or filename is of the wrong type.
            ValueError: If the filename contains invalid characters.
        """
        if not isinstance(segment, np.ndarray):
            logger.error("Invalid segment type. segment must be a numpy.ndarray")
            raise TypeError("segment must be a numpy.ndarray")
        if segment.dtype not in self.SUPPORTED_DTYPES:
            logger.error(f"Invalid segment dtype. segment must be one of {self.SUPPORTED_DTYPES}")
            raise TypeError(f"segment must be one of {self.SUPPORTED_DTYPES}")

        if not isinstance(filename, str):
            raise TypeError("filename must be a string")
        if any(char in filename for char in self.FILENAME_CHARS_INVALID):
            raise ValueError(f"filename contains invalid characters: {self.FILENAME_CHARS_INVALID}")


        filepath = self._segments_dir / f"{filename}.wav"

        try:
            sf.write(str(filepath), segment, self._sample_rate)
        except Exception as e:
            logger.error(f"Error saving segment to {filepath}: {e}")
            return


    def delete_segment(self, filename):
        """Deletes a saved audio segment file.
        
        Args:
            filename (str): Name of the file to delete, without extension.
        """
        filepath = self._segments_dir / f"{filename}"
        
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                logger.error(f"Error deleting segment {filepath}: {e}")
        else:
            logger.warning(f"Segment {filepath} does not exist.")
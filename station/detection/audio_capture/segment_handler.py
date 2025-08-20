"""Handles saving audio segments to disk."""
import os
from pathlib import Path
import soundfile as sf

class SegmentHandler:
    """ Handles saving audio segments to disk.
    
    Args:
        config (dict): Configuration dictionary containing paths and audio settings.
    
    Methods:
        save(segment, filename): Saves an audio segment to a file.
    """
    
    
    def __init__(self, config):
        """ Initializes the SegmentSaver with configuration parameters.

        Args:
            config (dict): Configuration dictionary containing paths and audio settings.
            
        Attributes:
            segments_dir (Path): Directory where audio segments will be saved.".
            sample_rate (int): Sample rate of the audio. Default is 48000 Hz.
        """
        self._segments_dir = Path(config.get("segments_dir", "station/data/segments")).resolve()
        self._sample_rate = config.get("sample_rate", 48000)


    def save_segment(self, segment, filename):
        """Saves an audio segment to a file.
        
        Args:
            segment (numpy.ndarray): Audio segment to be saved, expected to be a numpy array of int16 type.
            filename (str): Name of the file to save the segment as, without extension.
        """
        filepath = self._segments_dir / f"{filename}.wav"

        try:
            sf.write(str(filepath), segment, self._sample_rate)
        except Exception as e:
            print(f"Error saving segment {filename}: {e}")
            return

        print(f"Saved segment: {filepath}")
        
        
    def delete_segment(self, filename):
        """Deletes a saved audio segment file.
        
        Args:
            filename (str): Name of the file to delete, without extension.
        """
        filepath = self._segments_dir / f"{filename}"
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"Deleted segment: {filepath}")
        else:
            print(f"Segment {filepath} does not exist.")
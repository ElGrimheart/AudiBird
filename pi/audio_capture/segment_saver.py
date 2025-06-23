"""Handles saving audio segments to disk."""
from pathlib import Path
import wave

class SegmentSaver:
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
            segments_dir (Path): Directory where audio segments will be saved.
            sample_rate (int): Sample rate of the audio.
            channels (int): Number of audio channels.
        """
        self.segments_dir = config.get("segments_dir", Path("pi\data\segments")).resolve()
        self.sample_rate = config.get("sample_rate", 48000)
        self.channels = config.get("channels", 1)
        self.sampwidth=2


    def save(self, segment, filename):
        """Saves an audio segment to a file.
        
        Args:
            segment (numpy.ndarray): Audio segment to be saved, expected to be a numpy array of int16 type.
            filename (str): Name of the file to save the segment as, without extension.
        """
        
        filepath = self.segments_dir / f"{filename}.wav"
        print(f"Saving segment to {filepath}...")
        
        with wave.open(str(filepath), 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.sampwidth)
            wf.setframerate(self.sample_rate)
            wf.writeframes(segment.tobytes())
            
        print(f"Saved segment: {filepath}")
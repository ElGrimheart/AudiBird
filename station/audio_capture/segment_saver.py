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
            segments_dir (Path): Directory where audio segments will be saved. Default is "pi/data/segments".
            sample_rate (int): Sample rate of the audio. Default is 48000 Hz.
            channels (int): Number of audio channels. Default is 1 (mono).
            sampwidth (int): Sample width in bytes. Default is 2 bytes (16-bit audio).
        """
        self.segments_dir = Path(config.get("segments_dir", "pi/data/segments")).resolve()
        self.sample_rate = config.get("sample_rate", 48000)
        self.channels = config.get("channels", 1)
        self.sampwidth = config.get("sample_width", 2)  


    def save(self, segment, filename):
        """Saves an audio segment to a file.
        
        Args:
            segment (numpy.ndarray): Audio segment to be saved, expected to be a numpy array of int16 type.
            filename (str): Name of the file to save the segment as, without extension.
        """
        
        filepath = self.segments_dir / f"{filename}.wav"
        print(f"Saving segment to {filepath}...")
        
        try :
            with wave.open(str(filepath), 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(self.sampwidth)
                wf.setframerate(self.sample_rate)
                wf.writeframes(segment.tobytes())
        except Exception as e:
            print(f"Error saving segment {filename}: {e}")
            return
            
        print(f"Saved segment: {filepath}")
        
        
    def delete_segment(self, filename):
        """Deletes a saved audio segment file.
        
        Args:
            filename (str): Name of the file to delete, without extension.
        """
        filepath = self.segments_dir / f"{filename}.wav"
        if filepath.exists():
            try:
                filepath.unlink()
                print(f"Deleted segment: {filepath}")
            except Exception as e:
                print(f"Error deleting segment {filename}: {e}")
        else:
            print(f"Segment {filename} does not exist.")
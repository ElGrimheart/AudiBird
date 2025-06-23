"""Captures audio from the microphone, segments it, and saves the segments to disk.
Separate threads are used for capturing, saving and streaming the audio data.    
"""
import sounddevice as sd
import queue
import threading
from datetime import datetime
from pathlib import Path

from audio_capture.segmenter import Segmenter 
from audio_capture.segment_saver import SegmentSaver

class AudioCapture:
    """Captures audio from the microphone, segments it, and saves the segments to disk.
    
    Args:
        config (dict): Configuration parameters for audio capture

    Methods:
        start(device=None): Starts continuous audio capture from the microphone.
        stop(): Stops the audio capture.
    """
     
    def __init__ (self, config):
        """Initializes the AudioCapture instance with configuration parameters.
        
        Args:
            config (dict): Configuration parameters for audio capture.
        
        Attributes:
            sample_rate (int): Sample rate of the audio. Default is 48000 Hz.
            channels (int): Number of audio channels. Default is 1 (mono).
            dtype (str): Data type of the audio samples. Default is 'int16'.
            segment_duration (int): Duration of each audio segment in seconds. Default is 60 seconds.
            segment_overlap (int): Overlap between segments in seconds. Default is 5 seconds.
            segments_dir (Path): Directory where audio segments will be saved. Default is 'pi/data/segments'.
            segmenter (Segmenter): Instance of Segmenter to handle audio segmentation.
            segment_saver (SegmentSaver): Instance of SegmentSaver to save audio segments.
            segments_queue (queue.Queue): Queue to hold segments for saving.
            running (bool): Flag to indicate if the audio capture is running.
        """
        
        # Initializing with configuration parameters
        self.sample_rate = config.get("sample_rate", 48000)
        self.channels = config.get("channels", 1)
        self.dtype = config.get("dtype", "int16")
        self.segment_duration = config.get("segment_duration", 60)
        self.segment_overlap = config.get("segment_overlap", 5)  
        self.segments_dir = config.get("segments_dir", Path("pi\data\segments")).resolve()
        
        # Setting up the Segmenter and Queue
        self.segmenter= Segmenter(config) 
        self.segment_saver = SegmentSaver(config)
        self.segments_queue = queue.Queue()
        
        self.running = False
                
        
        """
        self.listeners = []  # List to hold listeners for live audio blocks
      
    def add_listener(self, callback):
        self.listeners.append(callback)
    """
        
    def start(self, device=None):
        """Start continuous audio capture from the microphone.

        Args:
            device (str, optional): The audio device to capture from. If None, the default device is used.
        """
        
        self.running = True
        print(f"Starting audio capture...")
        print(f"Sample Rate: {self.sample_rate}, Channels: {self.channels}, Segment Duration: {self.segment_duration} seconds")
        print("Press Ctrl+C to stop capture.")
        
        
        def callback(indata, frames, time, status):
            """Callback function to process audio data in real-time."""
            if self.running:
                
                """
                for listener in self.listeners:
                    listener(indata.copy())
                """
                
                self.segmenter.append_audio(indata)  
                for segment in self.segmenter.get_segments():
                    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                    self.segments_queue.put((segment, timestamp))
                
                
        # Thread to save segments in the background
        save_thread = threading.Thread(target=self._save_segments, daemon=True)     # True means the thread will exit when the main program exit
        save_thread.start()
        
        
        # Starting the audio stream
        try:
            with sd.InputStream(
                device=device,
                samplerate=self.sample_rate, 
                channels=self.channels, 
                dtype=self.dtype,
                callback=callback
            ):
                while self.running:
                    sd.sleep(1000)  # Keep the stream alive
        except KeyboardInterrupt:
            print("Audio capture interrupted by user.")
            self.running = False
        except Exception as e:
            print(f"Error starting audio capture: {e}")
            self.running = False
        finally:
            self.stop()
            print("Audio capture stopped.")
         
            
    def _save_segments(self):    
        """Background thread to save audio segments from the queue.
        This method runs in a separate thread to continuously save segments as they are captured.
        """
     
        while self.running:
            try:
                segment, timestamp = self.segments_queue.get(timeout=1) #timeout to prevent blocking indefinitely
                self.segment_saver.save(segment, timestamp)
                self.segments_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error saving segment: {e}")
            
    
    def stop(self):
        """Stops the audio capture and ensures that any remaining segments in the queue are processed before exiting.
        """
        self.running = False
        
        while not self.segments_queue.empty():
            try:
                segment, timestamp = self.segments_queue.get_nowait()
                self.segment_saver.save(segment, timestamp)
                self.segments_queue.task_done()
            except queue.Empty:
                break
        
        print("Audio capture stopped")

   
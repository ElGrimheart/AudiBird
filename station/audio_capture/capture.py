"""Captures audio from the microphone, segments it and saves the segments to disk."""
import sounddevice as sd
import queue
import threading
from datetime import datetime

class AudioCapture:
    """Captures audio from the microphone, segments it with the provided segmenter,
    and saves the segments using the provided segment_saver.
    
    Methods:
        start(): Starts continuous audio capture from the microphone.
        stop(): Stops the audio capture and processes any remaining segments in the queue.
        _save_segments(): Background thread to save audio segments from the queue.
    """
     
    def __init__ (self, config, segmenter, segment_saver, on_segment_ready=None):
        """Initializes the AudioCapture with configuration parameters, a segmenter, and a segment_saver.
        
        Args:
            config (dict): Configuration parameters for audio capture.
            segmenter (Segmenter): An instance of a segmenter to process audio data.
            segment_saver (SegmentSaver): An instance of a segment_saver to save audio segments.
            on_segment_ready (callable, optional): Callback function to notify when a segment is ready.
        
        Attributes:
            sample_rate (int): Sample rate for audio capture. Defaults to 48000.
            channels (int): Number of audio channels. Defaults to 1.
            dtype (str): Data type for audio samples. Defaults to "int16".
            segmenter (Segmenter): The segmenter instance to process audio data.
            segment_saver (SegmentSaver): The segment_saver instance to save audio segments.
            segments_queue (queue.Queue): Queue to hold audio segments for processing.
            on_segment_ready (callable): Callback function to notify when a segment is ready.
            listeners (list): List of listeners for live audio blocks.
            running (bool): Flag to indicate if the audio capture is running.
        """
        
        # Initializing with configuration parameters
        self.sample_rate = config.get("sample_rate", 48000)
        self.channels = config.get("channels", 1)
        self.dtype = config.get("dtype", "int16")
        
        self.segmenter = segmenter
        self.segment_saver = segment_saver
        self.segments_queue = queue.Queue()
       
        self.on_segment_ready = on_segment_ready
        self.listeners = []     
        
        self.running = False   
        
        """
        self.listeners = []  # List to hold listeners for live audio blocks
      
    def add_listener(self, callback):
        self.listeners.append(callback)
    """
        
    def start(self, device=None):
        """Starts continuous audio capture from the microphone.
        
        Args:
            device (int, optional): The audio input device ID. If None, the default device is used.
        
        Attributes:
            running (bool): Flag to indicate if the audio capture is currently running.
        """
        
        self.running = True
        print(f"Starting audio capture...")
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
        This method continuously checks the segments queue for new segments and saves them using the segment_saver
        until the running flag is set to False.
        
        Args:
            None
            
        Attributes:
            running (bool): Flag to indicate if the audio capture is currently running.         
        """
     
        while self.running:
            try:
                segment, timestamp = self.segments_queue.get(timeout=1) #timeout to prevent blocking indefinitely
                self.segment_saver.save(segment, timestamp)
                if self.on_segment_ready:
                    self.on_segment_ready(timestamp)  # Notify listeners that a segment is ready
                self.segments_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error saving segment: {e}")
            
    
    def stop(self):
        """Stops the audio capture and processes any remaining segments in the queue.
        
        Args:
            None
            
        Attributes:
            running (bool): Flag to indicate if the audio capture is currently running.
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

   
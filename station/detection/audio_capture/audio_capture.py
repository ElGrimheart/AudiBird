"""Captures audio from the microphone, segments it and saves the segments to disk."""
import sounddevice as sd
import queue
import threading
from datetime import datetime, timezone

class AudioCapture:
    """Captures audio from the microphone, segments it with the provided segmenter,
    and saves the segments using the provided segment_saver.
    
    Methods:
        start(): Starts continuous audio capture from the microphone.
        stop(): Stops the audio capture and processes any remaining segments in the queue.
        _save_segments(): Background thread to save audio segments from the queue.
    """
     
    def __init__ (self, config, segmenter, segment_handler, on_segment_ready=None):
        """Initializes the AudioCapture with configuration parameters, Segmenter, and SegmentHandler.
        
        Args:
            config (dict): Configuration parameters for audio capture.
            segmenter (Segmenter): An instance of a segmenter to process and segment the audio stream.
            segment_handler (SegmentHandler): An instance of a SegmentHandler to handle audio segments.
            on_segment_ready (callable): Callback function to notify when a segment is ready.
        
        Attributes:
            sample_rate (int): Sample rate for audio capture. Defaults to 48000.
            channels (int): Number of audio channels. Defaults to 1.
            dtype (str): Data type for audio samples. Defaults to "int16".
            segmenter (Segmenter): The segmenter instance to process audio data.
            segment_handler (SegmentHandler): The segment_handler instance which saves the audio segments.
            segments_queue (queue.Queue): Queue to hold audio segments for processing.
            on_segment_ready (callable): Callback function to notify when a segment is ready.
            listeners (list): List of listeners for live audio blocks.
            running (bool): Flag to indicate if the audio capture is running.
        """

        # Initialize with configuration parameters
        self._sample_rate = config.get("sample_rate", 48000)
        self._channels = config.get("channels", 1)
        self._dtype = config.get("dtype", "int16")

        self._segmenter = segmenter
        self._segment_handler = segment_handler
        self._segments_queue = queue.Queue()

        self._on_segment_ready = on_segment_ready
        self._listeners = []     

        self._running = False
        
        
    def start(self, device=None):
        """Starts continuous audio capture from the microphone.
        
        Args:
            device (int, optional): The audio input device ID. If None, the default device is used.
        
        Attributes:
            running (bool): Flag to indicate if the audio capture is currently running.
        """

        self._running = True
        print(f"Starting audio capture...")

        # Start background thread for saving segments
        self._save_thread = threading.Thread(target=self._save_segments, daemon=True,name=f"AudioCaptureSaveThread {id(self)}")    
        self._save_thread.start()

        # Starting the audio stream with callback for notifying listeners
        try:
            with sd.InputStream(
                device=device,
                samplerate=self._sample_rate, 
                channels=self._channels, 
                dtype=self._dtype,
                callback=self._audio_callback
            ):
                while self._running:        # Keep the stream alive
                    sd.sleep(1000)
        except Exception as e:
            print(f"Error starting audio capture: {e}")
            self._running = False
        finally:
            self.stop()
            print("Audio capture stopped.")
            
    
    def _audio_callback(self, indata, frames, time, status):
        """Callback function to process audio data as it is captured.
        Notifies listeners and appends audio data to the segmenter.
        """
        if self._running:
            for listener in self._listeners:
                listener(indata.copy())
            self._segmenter.append_audio(indata)
            for segment in self._segmenter.get_segments():
                timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
                self._segments_queue.put((segment, timestamp))
         
            
    def _save_segments(self):    
        """Saves audio segments from the queue to disk.
        Continuously checks the segments queue for new segments and saves them using the SegmentHandler.
        Also notifies the on_segment_ready callback when a segment is saved.

        Args:
            None
            
        Attributes:
            running (bool): Flag to indicate if the audio capture is currently running.         
        """
     
        while self._running:
            try:
                segment, timestamp = self._segments_queue.get(timeout=1)
                self._segment_handler.save_segment(segment, timestamp)
                if self._on_segment_ready:
                    self._on_segment_ready(timestamp) 
                self._segments_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error saving segment: {e}")


    def add_listener(self, callback):
        """Adds a listener to receive live audio blocks."""
        self._listeners.append(callback)
            
            
    def stop(self):
        """Stops the audio capture and processes

        Attributes:
            running (bool): Flag to indicate if the audio capture is currently running.
        """
        self._running = False

        if hasattr(self, '_save_thread') and self._save_thread.is_alive():
            self._save_thread.join(timeout=5)

        print("Audio capture stopped.")

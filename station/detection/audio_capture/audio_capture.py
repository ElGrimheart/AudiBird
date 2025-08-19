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
        self._sample_rate = config.get("sample_rate", 48000)
        self._channels = config.get("channels", 1)
        self._dtype = config.get("dtype", "int16")

        self._segmenter = segmenter
        self._segment_saver = segment_saver
        self._segments_queue = queue.Queue()

        self._on_segment_ready = on_segment_ready
        self._listeners = []     

        self._running = False

      
    def add_listener(self, callback):
        """Adds a listener to receive live audio blocks."""
        self._listeners.append(callback)

        
    def start(self, device=None):
        """Starts continuous audio capture from the microphone.
        
        Args:
            device (int, optional): The audio input device ID. If None, the default device is used.
        
        Attributes:
            running (bool): Flag to indicate if the audio capture is currently running.
        """

        self._running = True
        print(f"Starting audio capture...")
        
        
        def callback(indata, frames, time, status):
            """Callback function to process audio data in real-time."""
            if self._running:
                
                # Notify listeners with the live audio block
                for listener in self._listeners:
                    listener(indata.copy())
                
                # Append audio data to the segmenter
                self._segmenter.append_audio(indata)
                for segment in self._segmenter.get_segments():
                    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
                    self._segments_queue.put((segment, timestamp))


        # Thread to save segments in the background
        self._save_thread = threading.Thread(
            target=self._save_segments, 
            daemon=True,
            name=f"AudioCaptureSaveThread {id(self)}"
        )    
        self._save_thread.start()
        
        
        # Starting the audio stream
        try:
            with sd.InputStream(
                device=device,
                samplerate=self._sample_rate, 
                channels=self._channels, 
                dtype=self._dtype,
                callback=callback
            ):
                while self._running:
                    sd.sleep(1000)  # Keep the stream alive
        except Exception as e:
            print(f"Error starting audio capture: {e}")
            self._running = False
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
     
        while self._running:
            try:
                segment, timestamp = self._segments_queue.get(timeout=1) #timeout to prevent blocking indefinitely
                self._segment_saver.save(segment, timestamp)
                if self._on_segment_ready:
                    self._on_segment_ready(timestamp)  # Notify listeners that a segment is ready
                self._segments_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error saving segment: {e}")

    def stop(self):
        """Stops the audio capture and processes
        
        Args:
            None
            
        Attributes:
            running (bool): Flag to indicate if the audio capture is currently running.
        """
        self._running = False

        if hasattr(self, '_save_thread') and self._save_thread.is_alive():
            self._save_thread.join(timeout=5)
        
        print("Audio capture stopped")

   
import sounddevice as sd
import queue
import threading
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class AudioCapture:
    """
    Continuously captures audio from the microphone and feeds it into the Segmenter for segmentation.

    Launches a separate thread for saving the segmented audio via the SegmentHandler.
    When a segment is ready, the callback function is invoked to allow further processing/analysis of 
    each segment.
    
    Attributes:
        _sample_rate (int): Sample rate for audio capture. Defaults to 48000 if none provided.
        _channels (int): Number of audio channels. Defaults to 1 if none provided.
        _dtype (str): Data type for audio samples. Defaults to "int16" if none provided.
        _segmenter (Segmenter): The Segmenter instance to segment the audio data.
        _segment_handler (SegmentHandler): The SegmentHandler instance which saves the audio segments.
        _segments_queue (queue.Queue): Queue to hold audio segments until they are processed.
        _on_segment_ready (callable): Callback function which handles further processing of the audio segments.
        _running (bool): Flag to indicate if the audio capture process is currently running.

    Methods:
        start(): Starts continuous audio capture from the microphone.
        stop(): Stops the audio capture and processes any remaining segments in the queue.
    """
    SAMPLE_RATE_DEFAULT = 48000
    CHANNELS_DEFAULT = 1
    DTYPE_DEFAULT = "int16"

    SAMPLE_RATE_MIN = 8000
    SAMPLE_RATE_MAX = 192000
    CHANNELS_MIN = 1
    CHANNELS_MAX = 2
    SUPPORTED_DTYPES = ("int16", "float32")

    def __init__ (self, config, segmenter, segment_handler, on_segment_ready=None):
        """Instantiates the AudioCapture class with the given configuration, segmenter, and segment handler.

        Args:
            config (dict): Configuration parameters for audio capture. Supported keys:
            - 'sample_rate' (int): Audio sample rate in Hz.
            - 'channels' (int): Number of audio channels.
            - 'dtype' (str): Data type for audio samples.
            segmenter (Segmenter): A Segmenter instance responsible for segmenting the audio stream.
            segment_handler (SegmentHandler): A SegmentHandler instance responsible for saving audio segments.
            on_segment_ready (callable, optional): Callback function called when a segment is saved.

        Raises:
            TypeError:
            - If config is not a dictionary
            - If any config parameter is of the wrong type
            ValueError:
            - If any config parameter is out of range
            - If Segmenter is invalid or does not provide implementation of required methods.
            - If SegmentHandler is invalid or does not provide implementation of required methods.
        """
        if not isinstance(config, dict):
            logger.error("config must be a dictionary")
            raise TypeError("config must be a dictionary")

        sample_rate = config.get("sample_rate", self.SAMPLE_RATE_DEFAULT)
        channels = config.get("channels", self.CHANNELS_DEFAULT)
        dtype = config.get("dtype", self.DTYPE_DEFAULT)

        # Validate config parameters
        if not isinstance(sample_rate, int):
            logger.error("Invalid sample_rate type. Sample rate must be an integer.")
            raise TypeError("sample_rate must be an integer")
        if not (self.SAMPLE_RATE_MIN <= sample_rate <= self.SAMPLE_RATE_MAX):
            logger.error(f"Invalid sample_rate value. sample_rate must be between {self.SAMPLE_RATE_MIN} and {self.SAMPLE_RATE_MAX}")
            raise ValueError(f"sample_rate must be between {self.SAMPLE_RATE_MIN} and {self.SAMPLE_RATE_MAX}")

        if not isinstance(channels, int):
            logger.error("Invalid channels type. channels must be an integer")
            raise TypeError("channels must be an integer")
        if not (self.CHANNELS_MIN <= channels <= self.CHANNELS_MAX):
            logger.error(f"Invalid channels value. channels must be between {self.CHANNELS_MIN} and {self.CHANNELS_MAX}")
            raise ValueError(f"channels must be between {self.CHANNELS_MIN} and {self.CHANNELS_MAX}")

        if dtype not in self.SUPPORTED_DTYPES:
            logger.error(f"Invalid dtype value. dtype must be one of {self.SUPPORTED_DTYPES}")
            raise ValueError(f"dtype must be one of {self.SUPPORTED_DTYPES}")

        # Validate segmenter and handler
        if not (hasattr(segmenter, "append_audio") and hasattr(segmenter, "get_segments")):
            logger.error("segmenter must implement callable append_audio and get_segments methods")
            raise ValueError("segmenter must implement callable append_audio and get_segments methods")

        if not (hasattr(segment_handler, "save_segment")):
            logger.error("segment_handler must implement callable save_segment method")
            raise ValueError("segment_handler must implement callable save_segment method")

        # Assign to instance variables
        self._sample_rate = sample_rate
        self._channels = channels
        self._dtype = dtype
        self._segmenter = segmenter
        self._segment_handler = segment_handler
        self._segments_queue = queue.Queue()
        self._on_segment_ready = on_segment_ready
        self._running = False
        
        logger.info(f"AudioCapture initialized with sample_rate={self._sample_rate}, channels={self._channels}, dtype={self._dtype}")
        
        
    def start(self, device=None):
        """Starts continuous audio capture from the microphone.

        Args:
            device (int, optional): The audio input device ID. If None, the default device is used.

        """
        if self._running:
            logger.warning("Audio capture is already running.")
            return
        
        self._running = True
        logger.info("Starting audio capture...")

        # Start thread for saving segments - prevents blocking the audio capture process
        self._save_thread = threading.Thread(target=self._save_segments, daemon=True,name=f"AudioCaptureSaveThread {id(self)}")    
        self._save_thread.start()


        # Start capturing audio - with callback for sending audio data to the segmenter
        try:
            with sd.InputStream(
                device=device,
                samplerate=self._sample_rate, 
                channels=self._channels, 
                dtype=self._dtype,
                callback=self._audio_callback
            ):
                while self._running:        # Keep the audio stream alive
                    sd.sleep(1000)
        except Exception as e:
            logger.exception("Error starting audio capture")
            self._running = False
            raise
        finally:
            self.stop()
            logger.info("Audio capture stopped.")
            
    
    def _audio_callback(self, indata, frames, time, status):
        """
        Callback function to process audio data in real time.
        While running - appends new audio data to the Segmenter's buffer. Also retrieves and 
        timestamps any completed segments from the Segmenter and adds them to the _segments_queue.
        """
        if self._running:
            self._segmenter.append_audio(indata)
            for segment in self._segmenter.get_segments():
                timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
                self._segments_queue.put((segment, timestamp))
         
            
    def _save_segments(self):    
        """
        Saves to disk any segments ready within the _segments_queue
        While running - checks the segments queue for new segments and saves them using the SegmentHandler.
        Also notifies the on_segment_ready callback when a segment has been saved.
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
                logger.error(f"Error saving segment: {e}")
                raise
            
            
    def stop(self):
        """
        Stops the audio capture process and terminates the segment saving thread.
        """
        if not self._running:
            logger.warning("Audio capture is not running.")
            return
        
        self._running = False

        if hasattr(self, '_save_thread') and self._save_thread.is_alive():
            self._save_thread.join(timeout=5)

        logger.info("Audio capture stopped.")

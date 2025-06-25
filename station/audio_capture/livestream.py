"""Demo to test audio streaming.
NOTE - to be superceded by Websockets or similar for streaming to frontend.
"""
import sounddevice as sd
import numpy as np

class LiveStream:
    def __init__(self, config):
        self.sample_rate = config.get("sample_rate", 48000)
        self.channels = config.get("channels", 1)
        self.dtype = config.get("dtype", "int16")
        self.output_device = config.get("output_device", None)
        self.stream = None

    def start(self):
        self.stream = sd.OutputStream(
            samplerate=self.sample_rate,
            channels=self.channels,
            dtype=self.dtype
        )
        self.stream.start()
        print("Starting live stream...")

    def stop(self):
        """Stop the live stream."""
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None
        print("Stopping live stream...")

    def play_audio(self, audio_block):
        """Play an audio block over the speakers."""
        if self.stream:
            audio_block = np.asarray(audio_block, dtype=self.dtype)
            self.stream.write(audio_block)
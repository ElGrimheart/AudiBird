import sounddevice as sd
import numpy as np

class LiveStream:
    def __init__(self, sample_rate=48000, channels=1, dtype='int16'):
        self.sample_rate = sample_rate
        self.channels = channels
        self.dtype = dtype
        self.stream = None
        print("LiveStream initialized.")

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
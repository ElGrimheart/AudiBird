import sounddevice as sd
import numpy as np
import wave
import queue
import threading
from datetime import datetime
from pathlib import Path

class AudioCapture:
    """Handles continuous audio capture from the microphone and saves it in WAV file segments based on the specified duration."""
    
    def __init__ (self, sample_rate, channels, segment_duration):
        """Initialize the AudioCapture instance with the specified parameters."""
        self.sample_rate = sample_rate
        self.channels = channels
        self.segment_duration = segment_duration
        self.dtype = 'int16'  
        
        self.running = False
        self.audio_buffer = []
        self.samples_per_segement = self.sample_rate * self.segment_duration
        self.segments_queue = queue.Queue()
        
        
    def start(self, device=None):
        """Start continuous audio capture from the microphone"""
        
        self.running = True
        print(f"Staring audio capture...")
        print(f"Sample Rate: {self.sample_rate}, Channels: {self.channels}, Segment Duration: {self.segment_duration} seconds")
        print("Press Ctrl+C to stop capture.")
        
        
        def callback(indata, frames, time, status):
            """Callback function to process audio data in real-time."""
            if self.running:
                self.audio_buffer.extend(indata.flatten())
            
                # Check if segment duration is reached
                if len(self.audio_buffer) >= self.samples_per_segement:
                    
                    # Extract the segment from the buffer
                    segment = np.array(self.audio_buffer[:self.samples_per_segement])
                    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

                    # Save the segment to the queue
                    self.segments_queue.put((segment, timestamp))
                    
                    # Reset the buffer
                    self.audio_buffer = self.audio_buffer[self.samples_per_segement:]
                    
        # Start thread to save segments
        save_thread = threading.Thread(target=self._save_segments, daemon=True)
        save_thread.start()
        
        # Start the audio stream
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
        """Thread function to save audio segments to WAV files."""
        
        while self.running:
            try:
                segment, timestamp = self.segments_queue.get(timeout=1)
                
                # Create a filename based on the timestamp
                filename = f"{timestamp}.wav"
                filepath = Path("data/segments") / filename
                print (Path.cwd())
                print(f"Saving segment to {filepath}...")
                
                # Save the segment to a WAV file
                with wave.open(str(filepath), 'wb') as wf:
                    wf.setnchannels(self.channels)
                    wf.setsampwidth(2)  # 16-bit audio
                    wf.setframerate(self.sample_rate)
                    wf.writeframes(segment.tobytes())
                    
                print(f"Saved segment: {filepath}")
                
                self.segments_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error saving segment: {e}")
            
    
    def stop(self):
        """Stop the audio capture"""
        
        self.running = False
        print("Audio capture stopped")


    
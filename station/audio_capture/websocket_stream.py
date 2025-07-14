import socketio
import time
import threading
from queue import Queue

class WebSocketStream:
    def __init__(self, url):
        self.url = url
        self.sio = socketio.Client()
        self.connected = False
        self.audio_queue = Queue(maxsize=10)  # Limit queue size to prevent lag
        self.last_send_time = 0
        self.send_interval = 0.05  # Send every 50ms (20 chunks/second)
        self._setup_events()
        self._start_audio_sender()
        # Add automatic connection attempt
        self.connect()
        
    def _setup_events(self):
        """Set up event handlers for the Socket.IO client."""
        @self.sio.event
        def connect():
            self.connected = True
            print(f"Connected to WebSocket server at {self.url}")
            
        @self.sio.event
        def disconnect():
            self.connected = False
            print("Disconnected from WebSocket server")
            
        @self.sio.event
        def connect_error(data):
            print(f"Connection failed: {data}")
            self.connected = False
            
    def _start_audio_sender(self):
        """Start background thread to send audio data at controlled intervals."""
        def audio_sender():
            while True:
                try:
                    if not self.audio_queue.empty() and self.connected and self.sio.connected:
                        current_time = time.time()
                        if current_time - self.last_send_time >= self.send_interval:
                            # Get latest audio data (drop older data to reduce lag)
                            audio_data = None
                            while not self.audio_queue.empty():
                                audio_data = self.audio_queue.get_nowait()
                            
                            if audio_data is not None:
                                self.sio.emit('mic-audio-chunk', audio_data)
                                self.last_send_time = current_time
                    
                    time.sleep(0.01)  # Small sleep to prevent CPU spinning
                except Exception as e:
                    print(f"Error in audio sender: {e}")
                    time.sleep(0.1)
        
        threading.Thread(target=audio_sender, daemon=True).start()
            
    def connect(self):
        """Connects to the WebSocket server."""
        if self.connected and self.sio.connected:
            return True
            
        try:
            if not self.sio.connected:
                print(f"Attempting to connect to {self.url}...")
                self.sio.connect(self.url)
                # Wait for connection to establish
                for _ in range(10):  # Wait up to 1 second
                    if self.sio.connected:
                        self.connected = True
                        print("WebSocket connected successfully")
                        return True
                    time.sleep(0.1)
            return self.sio.connected
        except Exception as e:
            print(f"Failed to connect to WebSocket server: {e}")
            self.connected = False
            return False
            
    def send_audio(self, audio_data):
        """Queues audio data to be sent at controlled intervals."""
        try:
            # Try to reconnect if disconnected
            if not self.connected or not self.sio.connected:
                self.connect()
                
            if self.connected:
                # Add to queue (drop if queue is full to prevent lag buildup)
                if not self.audio_queue.full():
                    self.audio_queue.put_nowait(audio_data.tobytes())
                else:
                    # Queue is full, drop oldest data
                    try:
                        self.audio_queue.get_nowait()
                        self.audio_queue.put_nowait(audio_data.tobytes())
                    except:
                        pass
                        
        except Exception as e:
            print(f"Error queuing audio data: {e}")
            self.connected = False
        
    def close(self):
        """Closes the WebSocket connection."""
        try:
            if self.sio.connected:
                self.sio.disconnect()
            self.connected = False
            print("Socket.IO connection closed.")
        except Exception as e:
            print(f"Error closing connection: {e}")
            self.connected = False
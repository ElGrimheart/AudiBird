import socketio
import time
import threading
from queue import Queue

class WebSocketStream:
    def __init__(self, url):
        self._url = url
        self._sio = socketio.Client()
        self._connected = False
        self._audio_queue = Queue(maxsize=10)  # Limit queue size to prevent lag
        self._last_send_time = 0
        self._send_interval = 0.05  # Send every 50ms (20 chunks/second)
        self._stop_event = threading.Event()  # <-- Add this
        self._audio_sender_thread = None  
        self._setup_events()
        self._start_audio_sender()
        # Add automatic connection attempt
        self.connect()
        
    def _setup_events(self):
        """Set up event handlers for the Socket.IO client."""
        @self._sio.event
        def connect():
            self._connected = True
            print(f"Connected to WebSocket server at {self._url}")

        @self._sio.event
        def disconnect():
            self._connected = False
            print("Disconnected from WebSocket server")

        @self._sio.event
        def connect_error(data):
            print(f"Connection failed: {data}")
            self._connected = False

    def _start_audio_sender(self):
        """Start background thread to send audio data at controlled intervals."""
        def audio_sender():
            while not self._stop_event.is_set():
                try:
                    if not self._audio_queue.empty() and self._connected and self._sio.connected:
                        current_time = time.time()
                        if current_time - self._last_send_time >= self._send_interval:
                            # Get latest audio data (drop older data to reduce lag)
                            audio_data = None
                            while not self._audio_queue.empty():
                                audio_data = self._audio_queue.get_nowait()

                            if audio_data is not None:
                                self._sio.emit('mic-audio-chunk', audio_data)
                                self._last_send_time = current_time

                    time.sleep(0.01)  # Small sleep to prevent CPU spinning
                except Exception as e:
                    print(f"Error in audio sender: {e}")
                    time.sleep(0.1)
        
        self._audio_sender_thread = threading.Thread(
            target=audio_sender, 
            daemon=True, name=f"WebSocketAudioSender {id(self)}"
        )
        self._audio_sender_thread.start()
            
    def connect(self):
        """Connects to the WebSocket server."""
        if self._connected and self._sio.connected:
            return True
            
        try:
            if not self._sio.connected:
                print(f"Attempting to connect to {self._url}...")
                self._sio.connect(self._url)
                # Wait for connection to establish
                for _ in range(10):  # Wait up to 1 second
                    if self._sio.connected:
                        self._connected = True
                        print("WebSocket connected successfully")
                        return True
                    time.sleep(0.1)
            return self._sio.connected
        except Exception as e:
            print(f"Failed to connect to WebSocket server: {e}")
            self._connected = False
            return False
            
    def send_audio(self, audio_data):
        """Queues audio data to be sent at controlled intervals."""
        try:
            # Try to reconnect if disconnected
            if not self._connected or not self._sio.connected:
                self.connect()

            if self._connected:
                # Add to queue (drop if queue is full to prevent lag buildup)
                if not self._audio_queue.full():
                    self._audio_queue.put_nowait(audio_data.tobytes())
                else:
                    # Queue is full, drop oldest data
                    try:
                        self._audio_queue.get_nowait()
                        self._audio_queue.put_nowait(audio_data.tobytes())
                    except:
                        pass
                        
        except Exception as e:
            print(f"Error queuing audio data: {e}")
            self._connected = False

    def close(self):
        """Closes the WebSocket connection."""
        try:
            self._stop_event.set()  # <-- Signal thread to stop
            if self._audio_sender_thread and self._audio_sender_thread.is_alive():
                self._audio_sender_thread.join(timeout=5)  # <-- Wait for thread to finish
            if self._sio.connected:
                self._sio.disconnect()
            self._connected = False
            print("Socket.IO connection closed.")
        except Exception as e:
            print(f"Error closing connection: {e}")
            self._connected = False

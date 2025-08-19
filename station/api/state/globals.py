import threading

# Global DetectionController instance. Locked to prevent race conditions
detection_controller = None
detection_controller_lock = threading.RLock()

# Global status update thread. Locked to prevent multiple threads from starting
status_update_thread = None
status_thread_lock = threading.RLock()
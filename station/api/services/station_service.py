# Service for safely instantiating, starting and stopping the DetectionController
# Uses a global lock to ensure thread safety
from detection.controllers import DetectionController
from api.state import globals
from api.services import get_static_config, get_station_config

def get_detection_controller():
    """
    Gets the current instance of the DetectionController, or creates a new one if it doesn't exist.

    Returns:
        DetectionController: The current instance of the DetectionController.
    """
    with globals.detection_controller_lock:
        if globals.detection_controller is None:
            station_config = get_station_config()
            static_config = get_static_config()
            globals.detection_controller = DetectionController(static_config, station_config)
        return globals.detection_controller
    
    
def detection_is_running():
    """
    Checks if an instance of DetectionController exists and if the detection process is running.

    Returns:
        bool: True if DetectionController exists and detection process is running, False otherwise.
    """
    if not globals.detection_controller:
        return False
    return globals.detection_controller.is_running()


def stop_detection():
    """
    Stops the detection process for the current instance of the DetectionController.

    Returns:
        bool: True if the DetectionController was stopped, False otherwise.
    """
    with globals.detection_controller_lock:
        if globals.detection_controller and globals.detection_controller.is_running():
            globals.detection_controller.stop()
            return True
    return False


def start_detection():
    """
    Starts the detection process for the current instance of the DetectionController.
    Otherwise creates a new instance of DetectionController and starts the detection process.

    Returns:
        bool: True if the DetectionController was started, False otherwise.
    """
    with globals.detection_controller_lock:
        if not globals.detection_controller:
            globals.detection_controller = get_detection_controller()
        if not globals.detection_controller.is_running():
            globals.detection_controller.start()
            return True
    return False


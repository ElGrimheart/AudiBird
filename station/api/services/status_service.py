# Service for posting continuous station status updates to the backend.
# Runs in a separate thread. Station required to be 'configured' before commencing status update posts
import os
import psutil
import requests
import time
import threading
from api.state import globals
from api.services import get_station_state, get_station_config
from api.services.station_service import detection_is_running
from api.services.storage_service import commence_storage_management
import logging

logger = logging.getLogger(__name__)


def start_status_upload_thread():
    """
    Starts the status upload thread if not already running.
    Uses a thread lock and global variable to prevent multiple threads from starting.
    """
    with globals.status_thread_lock:
        if globals.status_update_thread and globals.status_update_thread.is_alive():
            return
        if get_station_state() == "configured":
            logger.info("Starting status upload thread...")
            globals.status_update_thread = threading.Thread(target=post_status_updates)
            globals.status_update_thread.start()


def post_status_updates():
    """
    Posts status updates to the backend server every 30 seconds.
    Requires the station to be in the 'configured' state before starting.

    Checks current disk usage against user-defined limit and initiates storage management 
    if necessary.
    """
    current_state = get_station_state()
    if current_state != "configured":
        logger.info("Station is not configured. Status updates will not be sent.")
        return

    config = get_station_config()
    station_id = config["station"]["id"]
    station_api_key = config["station"]["api_key"]

    # Continuously post status updates every 30 seconds
    while True:
        try:
            status = get_hardware_status()
        except Exception as e:
            logger.error(f"Error getting hardware status: {e}")

        # Check if disk usage > user-defined limit
        if status["disk_usage"] > float(config["storage_manager"]["max_storage_usage_percent"]):
            commence_storage_management()

        # Post status to backend
        try:
            response = requests.post(
                f"{os.environ.get('API_STATIONS_ROUTE')}/status/{station_id}",
                headers={'Authorization': f'Bearer {station_api_key}'},
                json=status)
            if response.status_code != 201:
                print(f"Failed to post status: {response.text}")
        except Exception as e:
            print(f"Error posting status: {e}")
        time.sleep(30)
        
        
def get_hardware_status():
    """
    Retrieves the current hardware status of the system.

    Returns:
        dict: A dictionary containing the following hardware status information:
            - is_recording (bool): Indicates if detection service is currently running.
            - cpu_temp (float or str): Current CPU temperature in Celsius, or 'N/A' if unavailable.
            - memory_usage (float): Percentage of memory currently in use.
            - disk_usage (float): Percentage of disk space currently in use on the root filesystem.
            - battery (float or str): Current battery percentage, or 'N/A' if unavailable.
    """
    return {
        "is_recording": detection_is_running(),
        "cpu_temp": psutil.sensors_temperatures()['cpu_thermal'][0].current if psutil.sensors_temperatures() else 'N/A',
        "memory_usage": psutil.virtual_memory().percent,
        "disk_usage": psutil.disk_usage('/').percent,
        "battery": psutil.sensors_battery().percent if psutil.sensors_battery() else 'N/A'
    }

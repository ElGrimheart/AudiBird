"""Handles the Station Flask Server and processes incoming requests."""

from flask import Flask, request, jsonify, send_from_directory
import requests
import time
import os
import psutil
import threading
import sys
from datetime import datetime
from controllers import DetectionController
from utils.config_loader import load_yaml_config, write_yaml_config
from dotenv import load_dotenv
load_dotenv()

STATION_CONFIG_PATH = 'config/station_config.yaml'
STATIC_CONFIG = load_yaml_config('config/static_config.yaml')
ALLOWABLE_STATES = ["unannounced", "announced", "claimed", "configured"]

app = Flask(__name__)

# Global variables for maintaining single instance of DetectionController
detection_controller = None
controller_lock = threading.Lock()              # Prevents race conditions when accessing the detection controller
state_watcher_stop_event = threading.Event()    # Event to stop the state watcher thread once station is configured
status_thread = None
status_thread_lock = threading.Lock()           # Prevents race conditions when accessing the status thread



def create_detection_controller():
    """Returns the global detection controller instance."""
    global detection_controller
    with controller_lock:
        if detection_controller is None:
            station_config = load_yaml_config(STATION_CONFIG_PATH)
            detection_controller = DetectionController(STATIC_CONFIG, station_config)
        return detection_controller


def get_station_state():
    """Get the current state of the station."""
    config = load_yaml_config(STATION_CONFIG_PATH)
    return config["station"]["state"]


def set_station_state(new_state):
    """Set the current state of the station."""
    if new_state not in ALLOWABLE_STATES:
        raise ValueError(f"Invalid state: {new_state}. Allowed states are: {ALLOWABLE_STATES}")

    config = load_yaml_config(STATION_CONFIG_PATH)
    config["station"]["state"] = new_state
    write_yaml_config(STATION_CONFIG_PATH, config)


def announce_station():
    """Announces the station to the backend server. 
    Updates the station's state if announcement is successful."""
    config = load_yaml_config(STATION_CONFIG_PATH)

    if (config["station"]["state"] != "unannounced"):
        return True

    payload = {
        "station_name": config["station"].get("station_name", "UNREGISTERED STATION"),
        "station_port": os.environ.get('FLASK_SERVER_PORT')
    }

    try:
        response = requests.post(
            f"{os.environ.get('API_STATIONS_ROUTE')}/announce",
            json=payload,
            timeout=5
        )

        if response.status_code == 201:
            new_station_config = response.json().get("result")
            new_station_config["station"]["state"] = "announced"
            write_yaml_config(STATION_CONFIG_PATH, new_station_config)
            print(f"Station announced. Please login to the web interface and register the station")
            return True
        else:
            print(f"Failed to announce station: {response.status_code} - {response.message}")
            return False
    except Exception as e:
        print(f"Error announcing station: {e}")
        return False
    

def detection_is_running():
    """Checks if the detection controller is running.

    Returns:
        bool: True if the detection controller is running, False otherwise.
    """
    detection_controller = create_detection_controller()
    if not detection_controller:
        return False
    return detection_controller.is_running()

def get_hardware_status():
    """Get the current status of the station hardware."""
    return {
        "is_recording": detection_is_running(),
        "cpu_temp": psutil.sensors_temperatures()['cpu_thermal'][0].current if psutil.sensors_temperatures() else 'N/A',
        "memory_usage": psutil.virtual_memory().percent,
        "disk_usage": psutil.disk_usage('/').percent,
        "battery": psutil.sensors_battery().percent if psutil.sensors_battery() else 'N/A'
    }
    
def post_status_updates():
    """Posts status updates to the backend server every 30 seconds."""
    config = load_yaml_config(STATION_CONFIG_PATH)
    station_id = config["station"]["id"]
    station_api_key = config["station"]["api_key"]

    while True:
        current_state = get_station_state()
        if current_state != "configured":
            time.sleep(30)
            continue
        
        status = get_hardware_status()
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


def start_status_status_thread():
    """Starts the status update thread if not already running."""
    global status_thread
    with status_thread_lock:
        if status_thread and status_thread.is_alive():
            return
        if get_station_state() == "configured":
            print("Starting status update thread...")
            status_thread = threading.Thread(target=post_status_updates)
            status_thread.start()

def state_watcher():
    """Watches for changes in the station state and takes appropriate action."""
    global detection_controller
    last = None
    while not state_watcher_stop_event.is_set():
        current_state = get_station_state()
        if current_state != last:
            print(f"Station state changed: {last} -> {current_state}")
            if current_state == "unannounced":
                print("Station is unannounced. Please check network connections and restart the station.")
            if current_state == "announced":
                print("Station is waiting to be registered. Please login to the web interface.")
            if current_state == "claimed":
                print("Station is claimed. Please configure the station through the web interface.")
            if current_state == "configured":
                start_status_status_thread()
                # Signal to stop the watcher
                detection_controller = create_detection_controller()
                detection_controller.start()
                state_watcher_stop_event.set()
                print("Station configured. Stopping state watcher thread...")
                break
        last = current_state
        time.sleep(30)
        



##################### Flask routes for the server ####################
@app.before_request
def authenticate_api_key():
    """Authenticate the API key for incoming requests."""
    config = load_yaml_config(STATION_CONFIG_PATH)
    request_api_key = request.headers.get('Authorization')
    
    if not request_api_key or request_api_key != f'Bearer {config["station"]["api_key"]}':
        return jsonify({
            "status": "failure",
            "message": "Forbidden: Invalid token"
        }), 403
    
    
@app.route('/claim', methods=['POST'])
def claim_station():
    """Claims the station and assigns it to the user."""
    current_state = get_station_state()

    if current_state == "announced":
        set_station_state("claimed")
        return jsonify({
            "status": "success",
            "message": "Station claimed successfully"
        }), 200
    else:
        return jsonify({
            "status": "failure",
            "message": "Station can not be claimed"
        }), 400


@app.route('/update-config', methods=['POST'])
def update_config():
    """Update the remote configuration file."""
    global detection_controller
    new_config = request.get_json()
    if not new_config:
        return jsonify({
            "status": "failure",
            "message": "No configuration data provided"
        }), 400
    
    try:
        write_yaml_config(f"{STATIC_CONFIG['paths']['configs_dir']}/station_config.yaml", new_config)
        
        # Recreate DetectionController with updated config
        if detection_controller and detection_controller.is_running():
            detection_controller.stop()
            
        with controller_lock:
            station_config = load_yaml_config(STATION_CONFIG_PATH)
            detection_controller = DetectionController(STATIC_CONFIG, station_config)
            detection_controller.start()
            
        return jsonify({
            "status": "success",
            "message": "Configuration updated successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@app.route('/start', methods=['POST'])
def start_recording():
    """Start the audio recording process."""
    current_state = get_station_state()

    if current_state != "configured":
        return jsonify({
            "status": "failure",
            "message": f"Cannot start in state: {current_state}"
        }), 400                         
    if detection_controller.is_running():
        return jsonify({
            "status": "failure",
            "message": "Station is already recording"
        }), 400
    if detection_controller.start():
        start_status_status_thread()
        return jsonify({
            "status": "success",
            "message": "Recording started successfully"
        }), 200
        
    return jsonify({
        "status": "error",
        "message": "Recording failed to start"
    }), 500


@app.route('/stop', methods=['POST'])
def stop_recording():
    """Stop the audio recording process."""
    if not detection_controller or not detection_controller.is_running():
        return jsonify({
            "status": "failure", 
            "message": "Not active"
        }), 400
    if detection_controller.stop():
        return jsonify({
            "status": "success",
            "state": get_station_state()
        }), 200
    return jsonify({
        "status": "error",
        "message": "Stop failed"
    }), 500

@app.route('/recordings/<path:file_name>')
def serve_audio(file_name):
    """Serve an audio recording file."""
    file_path = os.path.join(STATIC_CONFIG['paths']['segments_dir'], file_name)

    if not os.path.exists(file_path):
        return jsonify({
            "status": "failure",
            "message": f"File {file_path} not found."
        }), 404

    return send_from_directory(STATIC_CONFIG['paths']['segments_dir'], file_name)


# Start the Flask server
if __name__ == '__main__':

    # Announce station if required (first launch)
    if not announce_station():
        check_config = load_yaml_config(STATION_CONFIG_PATH)
        if not check_config['station']['id'] or not check_config['station']['api_key']:
            print("Failed to announce station. Please check network connections. Exiting...")
            sys.exit(1)


    # Monitor station state until configured, then launch detection process
    current_state = get_station_state()
    
    if current_state == "announced":
        config = load_yaml_config(STATION_CONFIG_PATH)
        station_id = config['station']['id']
        station_api_key = config['station']['api_key']
        print(f"Station is not registered. Please register using the station ID: {station_id} and API Key: {station_api_key}")
    elif current_state == "claimed":
        print("Station awaiting configuration...")
    elif current_state == "configured":
        print("Launching detection...")
        detection_controller = create_detection_controller()
        detection_controller.start()
        start_status_status_thread()

    threading.Thread(target=state_watcher, daemon=True).start()


    # Launch the Flask server
    app.run(
        host=os.environ.get("FLASK_SERVER_HOST"), 
        port=os.environ.get("FLASK_SERVER_PORT")
    )
    print(f"Server running on {os.environ.get('FLASK_SERVER_HOST')}:{os.environ.get('FLASK_SERVER_PORT')}")
    print("Press Ctrl+C to stop the server.")
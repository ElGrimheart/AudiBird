from flask import Flask, config, request, jsonify, send_from_directory
import requests
import time
import os
import subprocess
import signal
import psutil
import threading
import sys
from utils.config_loader import load_yaml_config, write_yaml_config
from dotenv import load_dotenv
load_dotenv()

STATIC_CONFIG = load_yaml_config('config/static_config.yaml')
STATION_CONFIG_PATH = 'config/station_config.yaml'
ALLOWABLE_STATES = ["unannounced", "announced", "claimed", "configured"]

PID_FILE = STATIC_CONFIG['temp']['process']


app = Flask(__name__)

# Helper functions for managing station state
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
    """Announce the station to the backend server."""
    config = load_yaml_config(STATION_CONFIG_PATH)

    if (config["station"]["state"] != "unannounced"):
        return True

    payload = {
        "station_name": "UNREGISTERED STATION",
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
            write_yaml_config(STATION_CONFIG_PATH, new_station_config)
            print(f"Station announced. Please login to the web interface and register the station")
            return True
        else:
            print(f"Failed to announce station: {response.status_code} - {response.message}")
            return False
    except Exception as e:
        print(f"Error announcing station: {e}")
        sys.exit(1)
        return False
    



detection_lock = threading.Lock()

def _read_pid():
    """Read the PID of the station process from the PID file."""
    if not os.path.exists(PID_FILE):
        return None
    try:
        with open(PID_FILE, 'r') as f:
            return int(f.read().strip())
    except Exception as e:
        print(f"Error reading PID file: {e}")
        return None
    
def _pid_running(pid):
    if pid is None:
        return False
    try:
        os.kill(pid, 0)
        return True
    except Exception as e:
        print(f"Error checking if PID {pid} is running: {e}")
        return False

def is_detection_active():
    pid = _read_pid()
    return bool(pid and _pid_running(pid))

def launch_detection():
    with detection_lock:
        # Check existing PID
        pid = _read_pid()
        if pid and _pid_running(pid):
            print(f"Detection already running (PID {pid}).")
            return False
        
        if pid and not _pid_running(pid) and os.path.exists(PID_FILE):
            try:
                os.remove(PID_FILE)
            except OSError:
                pass
    
    try:
        process = subprocess.Popen(['python3', STATIC_CONFIG['scripts']['start_capture']])
        with open(PID_FILE, 'w') as f:
            f.write(str(process.pid))
        print("Detection started successfully.")
        return True
    except Exception as e:
        print(f"Error starting detection: {e}")
        return False

def stop_detection():
    """Stop the audio detection process."""
    if not is_detection_active():
        print("Detection is not active.")
        return False

    try:
        pid = _read_pid()
        if pid and _pid_running(pid):
            os.kill(pid, signal.SIGTERM)
            os.remove(PID_FILE)
            print("Detection stopped successfully.")
            return True
        else:
            print("No active detection process found.")
            return False
    except Exception as e:
        print(f"Error stopping detection: {e}")
        return False
    
    

status_thread = None
status_thread_lock = threading.Lock()

def get_hardware_status():
    """Get the current status of the station hardware."""
    return {
        "is_recording": True if is_detection_active() else False,
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
    global status_thread
    with status_thread_lock:
        if status_thread and status_thread.is_alive():
            return
        if get_station_state() == "configured":
            status_thread = threading.Thread(target=post_status_updates)
            status_thread.start()


def state_watcher():
    last = None
    while True:
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
        time.sleep(30)



# Flask routes for the station control server
@app.before_request
def authenticate_api_key():
    """Authenticate the API key for incoming requests."""
    config = load_yaml_config(STATION_CONFIG_PATH)
    
    request_api_key = request.headers.get('Authorization')
    print(f"Request API Key: {request_api_key}")
    print(f"Configured API Key: {config['station']['api_key']}")
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
    new_config = request.get_json()
    if not new_config:
        return jsonify({
            "status": "failure",
            "message": "No configuration data provided"
        }), 400
    
    try:
        write_yaml_config(f"{STATIC_CONFIG['paths']['configs_dir']}/station_config.yaml", new_config)
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
    if is_detection_active():
        return jsonify({
            "status": "failure",
            "message": "Station is already recording"
        }), 400
    if launch_detection():
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
    if not is_detection_active():
        return jsonify({
            "status": "failure", 
            "message": "Not active"
        }), 400
    if stop_detection():
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
        launch_detection()
        start_status_status_thread()

    threading.Thread(target=state_watcher, daemon=True).start()
        
    app.run(
        host=os.environ.get("FLASK_SERVER_HOST"), 
        port=os.environ.get("FLASK_SERVER_PORT")
    )
    print(f"Server running on {os.environ.get('FLASK_SERVER_HOST')}:{os.environ.get('FLASK_SERVER_PORT')}")
    print("Press Ctrl+C to stop the server.")
# Endpoints for the Flask application
import os
from flask import Blueprint, request, jsonify, send_from_directory
from api.state import globals
from api.services import (
    get_station_state, 
    set_station_state, 
    get_station_config, 
    save_station_config,  
    get_static_config,
    get_detection_controller,
    detection_is_running,
    start_detection,
    stop_detection
)


station_bp = Blueprint('station', __name__)

@station_bp.before_request
def authenticate_api_key():
    """Authenticates the API key contained in the request headers.
    Responds with a 403 Forbidden status if the API key is invalid, otherwise
    allows the request to proceed.
    """
    config = get_station_config()
    request_api_key = request.headers.get('Authorization')
    
    if not request_api_key or request_api_key != f'Bearer {config["station"]["api_key"]}':
        return jsonify({
            "status": "failure",
            "message": "Forbidden: Invalid token"
        }), 403


@station_bp.route('/claim', methods=['POST'])
def claim_station():
    """Claims the station and assigns it to the user.
    Updates the station's state to 'claimed' if it is currently 'announced'.
    """
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


@station_bp.route('/update-config', methods=['POST'])
def update_config():
    """Updates the station configuration file with the provided configuration data.
    Closes and reinstantiates the global DetectionController with the updated configuration
    """
    new_config = request.get_json()
    if not new_config:
        return jsonify({
            "status": "failure",
            "message": "No configuration data provided"
        }), 400
    
    try:
        print("Updating station configuration...")
        save_station_config(new_config)

        # Stop existing DetectionController if running
        if detection_is_running():
            stop_detection()

        # Instantiate new DetectionController with updated config
        globals.detection_controller = None
        with globals.detection_controller_lock:
            start_detection()

        return jsonify({
            "status": "success",
            "message": "Configuration updated successfully"
        }), 200
    except Exception as e:
        print(f"Error updating configuration: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@station_bp.route('/start', methods=['POST'])
def start_recording():
    """Start the detection process of the DetectionController"""
    current_state = get_station_state()

    if current_state != "configured":
        return jsonify({
            "status": "failure",
            "message": f"Cannot start in state: {current_state}"
        }), 400                         
    if detection_is_running():
        return jsonify({
            "status": "failure",
            "message": "Station is already recording"
        }), 400


    if start_detection():
        return jsonify({
            "status": "success",
            "message": "Recording started successfully"
        }), 200
        
    return jsonify({
        "status": "error",
        "message": "Recording failed to start"
    }), 500


@station_bp.route('/stop', methods=['POST'])
def stop_recording():
    """Stop the detection process of the DetectionController."""
    if not get_detection_controller or not detection_is_running():
        return jsonify({
            "status": "failure", 
            "message": "Not active"
        }), 400
    
    stop_detection()

    if not detection_is_running():
        return jsonify({
            "status": "success",
            "state": get_station_state()
        }), 200
    return jsonify({
        "status": "error",
        "message": "Stop failed"
    }), 500


@station_bp.route('/recordings/<path:file_name>')
def serve_audio(file_name):
    """Serves the requested recording file to the backend if it exists.
    Otherwise returns a 404 error if the file is not found."""
    static_config = get_static_config()
    recordings_dir = os.path.abspath(static_config['paths']['recordings_dir'])
    file_path = os.path.join(recordings_dir, file_name)

    if not os.path.exists(file_path):
        return jsonify({
            "status": "failure",
            "message": f"File {file_path} not found."
        }), 404

    return send_from_directory(recordings_dir, file_name)
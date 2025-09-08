# Entry point for station startup. Handles initial configuration and instantiating the DetectionController
import os
import sys
import requests
import time
from api.services.config_service import get_station_state, get_station_config, save_station_config
from api.services.station_service import get_detection_controller, start_detection
from api.services.status_service import start_status_upload_thread
import logging

logger = logging.getLogger(__name__)

def station_startup():
    """
    Initializes the station by monitoring its state and starting the detection service once station 
    is configured.

    On first run station will be in "unannounced" state and will attempt to announce itself to backend.
    If successful the backend will respond with the station ID and API key - which are saved to the
    station_config file are required for all future interactions with the station via the Flask server.

    Following successful announcement the station will transition to the "announced" state and await
    registration and configuration through the web-app, updating to "claimed" and "configured" states, 
    respectively.

    Once successfully configured the station will launch the detection process, and start the status_update
    thread which continuously uploads the station's status to the backend.

    Once configured, the station will skip the announcement step on subsequent runs and instead request the latest 
    config from the backend, before proceeding to launch the detection process and status upload thread.

    """
    try:
        # Check if first run and handle announcement to backend if required
        if (is_first_run):
            announce_station()
            config_check = get_station_config()
            if not config_check['station']['id'] or not config_check['station']['api_key']:
                logger.error("Failed to announce station. Please check network connections and retry. Exiting...")
                sys.exit(1)


        # Monitor station state until configured, then launch detection process
        while True:
            current_state = get_station_state()

            match current_state:
                case "announced":
                    config = get_station_config()
                    station_id = config['station']['id']
                    station_api_key = config['station']['api_key']
                    logger.info(f"Station has not been registered. Please register through the web application using the station ID: {station_id} and API Key: {station_api_key}")
                case "claimed":
                    logger.info("Station awaiting configuration. Please finish configuring the station through the web application.")
                case "configured":
                    logger.info("Launching detection...")
                    fetch_latest_config()
                    get_detection_controller()
                    start_detection()
                    start_status_upload_thread()
                    break
                case _:
                    print(f"Unknown station state: {current_state}")
            time.sleep(10)
    except Exception as e:
        logger.error(f"Fatal error occurred: {e}")
        sys.exit(1)

    
def is_first_run():
    """
    Checks if the station is in an 'unannounced' state, indicating a first run.

    Returns:
        bool: True if the station is in the 'unannounced' state, False otherwise.
    """
    current_state = get_station_state()
    return current_state == "unannounced"
    
    
def announce_station():
    """
    Announces the station to the backend server.
    Updates the station's state if announcement is successful.
    """
    config = get_station_config()

    if (config["station"]["state"] != "unannounced"):
        return

    payload = {
        "station_name": config["station"].get("station_name", "UNREGISTERED STATION"),
        "station_port": os.environ.get('FLASK_SERVER_PORT')
    }

    try:
        # Send announcement request
        response = requests.post(
            f"{os.environ.get('API_STATIONS_ROUTE')}/announce",
            json=payload,
            timeout=5
        )

        # Update station configuration if announcement is successful
        if response.status_code == 201:
            new_station_config = response.json().get("result")
            new_station_config["station"]["state"] = "announced"
            save_station_config(new_station_config)
            logger.info("Station announced. Please login to the web interface and register the station")
        else:
            logger.error(f"Failed to announce station: {response.status_code} - {response.message}")
    except Exception as e:
        logger.error(f"Error announcing station: {e}")


def fetch_latest_config():
    """
    Fetch the latest config from the backend and update the local station config file.
    """
    config = get_station_config()
    station_id = config['station'].get('id')
    api_key = config['station'].get('api_key')

    if not station_id or not api_key:
        logger.error("Missing station ID or API key. Cannot fetch latest config.")
        return False

    try:
        response = requests.get(
            f"{os.environ.get('API_STATIONS_ROUTE')}/config/{station_id}",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=5
        )
        if response.status_code == 200:
            latest_config = response.json().get("result")
            if latest_config:
                save_station_config(latest_config.get("station_config"))
                logger.info("Fetched and updated local config from backend.")
                return True
            else:
                logger.warning("No config found in backend response.")
        else:
            logger.error(f"Failed to fetch config: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Error fetching latest config: {e}")
    return False
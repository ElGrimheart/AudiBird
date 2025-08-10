from datetime import datetime
import requests
import os
from utils.config_loader import load_yaml_config

# Load configuration from YAML files
STATIC_CONFIG = load_yaml_config('config/static_config.yaml')
STATION_CONFIG = load_yaml_config('config/station_config.yaml')


def upload_detection(filename, detection, station_metadata, audio_metadata, processing_metadata):
    """Posts detection data to the remote database API.

    Args:
        filename (str): The name of the audio file being processed.
        detection (dict): The detection data to be posted.
        station_metadata (dict): Metadata about the station.
        audio_metadata (dict): Metadata about the audio recording.
        processing_metadata (dict): Metadata about the processing of the audio.

    Returns:
        dict: The response from the API.
    """
    detections_route = os.environ.get("API_DETECTIONS_ROUTE")
    station_id = STATION_CONFIG['station']['id']
    station_api_key = STATION_CONFIG['station']['api_key']

    post_detection_route = detections_route + "/new/" + station_id
    headers = {
        "Authorization": f"Bearer {station_api_key}",
        "Content-Type": "application/json"
    }
    
    base = filename.replace('.wav', '')
    timestamp = datetime.strptime(base, "%Y%m%d_%H%M%S_%f")

    try:
        response = requests.post(
            post_detection_route,
            headers=headers,
            json={
                "common_name": detection.get("common_name"),
                "scientific_name": detection.get("scientific_name"),
                "confidence": detection.get("confidence"),
                "detection_timestamp": timestamp.isoformat(),
                "station_metadata": station_metadata,
                "audio_metadata": audio_metadata,
                "processing_metadata": processing_metadata,
                "recording_file_name": filename + ".wav"
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as e:
        print(f"Error posting detection: {e}")
        if e.response is not None:
            print("Response content:", e.response.text)
        return None
    except requests.RequestException as e:
        print(f"Error posting detection: {e}")
        return None
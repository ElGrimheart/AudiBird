from datetime import datetime
import requests
import os
from utils.config_loader import load_yaml_config

def upload_detection(filename, detection, config, station_metadata, audio_metadata, processing_metadata):
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
    print("Uploading detection for file:", filename)
    
    detections_route = os.environ.get("API_DETECTIONS_ROUTE")
    station_id = config['station_id']
    station_api_key = config['station_api_key']
    print("station_id:", station_id)
    print("station_api_key:", station_api_key)
    print("detections_route:", detections_route)

    post_detection_route = detections_route + "/new/" + station_id
    print("post_detection_route:", post_detection_route)
    headers = {
        "Authorization": f"Bearer {station_api_key}",
        "Content-Type": "application/json"
    }
    print("filename:", filename)
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
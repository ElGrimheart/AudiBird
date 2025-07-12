import requests
from utils.config_loader import load_yaml_config

# Load configuration from YAML files
local_config = load_yaml_config('config/local_config.yaml')
remote_config = load_yaml_config('config/remote_config.yaml')


def upload_detection(filename, detection, station_metadata, audio_metadata, processing_metadata):
    """Posts detection data to the remote database API.

    Args:
        station_id (str): The ID of the station making the detection.
        detection_data (dict): The detection data to be posted.

    Returns:
        dict: The response from the API.
    """
    api_url = local_config['db_api']['url']
    station_id = remote_config['station']['id']
    detection_route = local_config['db_api']['routes']['post_detection']
    
    segment_path = local_config['paths']['segments_dir'] + '/' + filename + '.wav'

    post_detection_route = api_url + station_id + detection_route

    response = requests.post(
        post_detection_route,
        json={
            "common_name": detection.get("common_name"),
            "scientific_name": detection.get("scientific_name"),
            "confidence": detection.get("confidence"),
            "detection_timestamp": detection.get("detection_timestamp"),
            "station_metadata": station_metadata,
            "audio_metadata": audio_metadata,
            "processing_metadata": processing_metadata,
            "audio_path": segment_path
        }
    )

    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()
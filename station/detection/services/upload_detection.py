from datetime import datetime
import requests
import os
import logging

logger = logging.getLogger(__name__)

def upload_detection(filename, detection, config, station_metadata, audio_metadata, processing_metadata):
    """
    Posts detection events to the backend API.
    Including the detection metadata and audio filename.

    Args:
        filename (str): The name of the audio file which contains the detection.
        detection (dict): The detection data to be posted.
        station_metadata (dict): Metadata about the station.
        audio_metadata (dict): Metadata about the audio recording.
        processing_metadata (dict): Metadata about the processing of the audio.

    Returns:
        dict: The response from the API.
    """
    if not isinstance(config, dict):
        logger.error("config must be a dictionary")
        raise TypeError("config must be a dictionary")
    for key in ["station_id", "station_api_key"]:
        if key not in config:
            logger.error(f"config missing required key: {key}")
            raise ValueError(f"config missing required key: {key}")
    if not isinstance(detection, dict):
        logger.error("detection must be a dictionary")
        raise TypeError("detection must be a dictionary")
    for key in ["common_name", "scientific_name", "confidence"]:
        if key not in detection:
            logger.error(f"detection missing required key: {key}")
            raise ValueError(f"detection missing required key: {key}")
    
    
    # Update metadata with specific detection information
    base = filename.replace('.wav', '')
    timestamp = datetime.strptime(base, "%Y%m%d_%H%M%S_%f")
    audio_metadata["duration"] = detection.get("duration")
    audio_metadata["filesize"] = detection.get("filesize")
    
    # Construct endpoint and payload
    detections_route = os.environ.get("API_DETECTIONS_ROUTE")
    station_id = config['station_id']
    station_api_key = config['station_api_key']

    post_detection_route = detections_route + "/new/" + station_id
    headers = {
        "Authorization": f"Bearer {station_api_key}",
        "Content-Type": "application/json"
    }
    
    # Post detection
    try:
        response = requests.post(
            post_detection_route,
            headers=headers,
            json={
                "common_name": detection.get("common_name"),
                "scientific_name": detection.get("scientific_name"),
                "confidence": detection.get("confidence"),
                "detection_timestamp": timestamp.isoformat(),
                "alternative_species": detection.get("alternatives", []),
                "station_metadata": station_metadata,
                "audio_metadata": audio_metadata,
                "processing_metadata": processing_metadata,
                "recording_file_name": filename
            }
        )
        response.raise_for_status()
        
        if response.status_code == 201:
            logger.info("Detection uploaded successfully: %s", response.json())
        return response.json()
    except requests.HTTPError as e:
        logger.error("Error posting detection: %s", e)
        if e.response is not None:
            logger.error("Response content: %s", e.response.text)
        return None
    except requests.RequestException as e:
        logger.error("Error posting detection: %s", e)
        return None
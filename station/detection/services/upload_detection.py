from datetime import datetime
import requests
import os

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
    
    # Update metadata with detection information and upload detection info
    base = filename.replace('.wav', '')
    timestamp = datetime.strptime(base, "%Y%m%d_%H%M%S_%f")
    audio_metadata["duration"] = detection.get("duration")
    audio_metadata["filesize"] = detection.get("filesize")
    
    
    # Construct endpoint and post payload
    detections_route = os.environ.get("API_DETECTIONS_ROUTE")
    station_id = config['station_id']
    station_api_key = config['station_api_key']

    post_detection_route = detections_route + "/new/" + station_id
    headers = {
        "Authorization": f"Bearer {station_api_key}",
        "Content-Type": "application/json"
    }
    
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
            print("Detection uploaded successfully:", response.json())
        return response.json()
    except requests.HTTPError as e:
        print(f"Error posting detection: {e}")
        if e.response is not None:
            print("Response content:", e.response.text)
        return None
    except requests.RequestException as e:
        print(f"Error posting detection: {e}")
        return None
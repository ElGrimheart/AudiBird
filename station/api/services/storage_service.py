# Service for managing station storage - handles disk usage and file protection
import os
from pathlib import Path
import psutil
import requests
from api.services import get_station_config
import logging

logger = logging.getLogger(__name__)

def commence_storage_management():
    """
    Starts the storage management process.

    Compares current disk usage with the user specified maximum allowed disk usage and takes 
    action if necessary.

    Requests a list of any protected audio files from the backend. 
    Retrieves the local audio files and compares them against the protected list.

    Cycles through the local audio files and deletes any that are not protected in batches of 50,
    starting with the oldest files first. Repeats until disk usage is below the maximum limit.
    
    """
    current_disk_usage = _get_current_disk_usage()
    config = get_station_config()
    max_disk_usage = float(config["storage_manager"]["max_storage_usage_percent"])

    protected_audio = _fetch_protected_audio_files()
    logger.info(f"Protected audio files: {protected_audio}")

    while current_disk_usage > max_disk_usage:
        logger.info(f"Current disk usage: {current_disk_usage}%. Exceeds maximum specified limit: {max_disk_usage}%.")
        local_audio_files = _get_local_audio_files()  

        # Filter out protected files
        unprotected_files = [f for f in local_audio_files if os.path.basename(f) not in protected_audio]

        if not unprotected_files:
            logger.info("No unprotected files left to delete.")
            break

        # Delete up to 50 oldest unprotected files
        for audio_file in unprotected_files[:50]:
            if os.path.exists(audio_file):
                logger.info(f"Deleting unprotected audio file: {audio_file}")
                os.remove(audio_file)

        current_disk_usage = _get_current_disk_usage()
        
    logger.info(f"Disk usage after deletion: {current_disk_usage}%")


def _get_current_disk_usage():
    """
    Returns the current disk usage percentage.
    """
    return psutil.disk_usage('/').percent


def _get_local_audio_files():
    """
    Returns a list of audio filenames from data/recordings, sorted by creation date (oldest first).
    """
    recordings_dir = Path("data/recordings").resolve()
    if not recordings_dir.exists():
        logger.info(f"Recordings directory {recordings_dir} does not exist.")
        return []

    audio_files = [file for file in recordings_dir.glob("*.wav") if file.is_file()]

    # Sort audio files by creation time (oldest first)
    audio_files.sort(key=lambda f: f.stat().st_ctime)

    # Return filenames as strings
    return [str(filename) for filename in audio_files]


def _fetch_protected_audio_files():
    """
    Fetches the list of ant protected audio files from the backend.
    """
    config = get_station_config()
    station_id = config['station'].get('id')
    api_key = config['station'].get('api_key')

    if not station_id or not api_key:
        logger.error("Missing station ID or API key. Cannot fetch latest protected audio files list.")
        return False

    try:
        response = requests.get(
            f"{os.environ.get('API_AUDIO_ROUTE')}/protected/{station_id}",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=5
        )
        if response.status_code == 200:
            protected_audio_files = response.json().get("result")
            if protected_audio_files:
                logger.info("Fetched protected audio file list")
                return [item["file_name"] for item in protected_audio_files if "file_name" in item]
            else:
                logger.info("No protected audio files found.")
                return []
        else:
            logger.error(f"Failed to fetch protected audio files: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Error fetching protected audio files: {e}")
    return []
# Service for reading, updating, and saving the station configuration
import os
import yaml
from dotenv import load_dotenv
load_dotenv()

# Configuration file paths and allowable states
STATION_CONFIG_PATH = os.environ.get("STATION_CONFIG_PATH")
STATIC_CONFIG_PATH = os.environ.get("STATIC_CONFIG_PATH")
ALLOWABLE_STATION_STATES = ["unannounced", "announced", "claimed", "configured"] 


def get_station_state():
    """Gets the current state of the station.
    
    Returns:
        str: The current state of the station.
    """
    config = _load_config(STATION_CONFIG_PATH)
    return config["station"]["state"]


def set_station_state(new_state):
    """Sets the current state of the station. 

    Args:
        new_state (str): The new state to set for the station.

    Raises:
        ValueError: If the new state is not allowed. Allowed states are: "unannounced", "announced", "claimed", "configured"
    """
    if new_state not in ALLOWABLE_STATION_STATES:
        raise ValueError(f"Invalid state: {new_state}. Allowed states are: {ALLOWABLE_STATION_STATES}")

    config = _load_config(STATION_CONFIG_PATH)
    config["station"]["state"] = new_state
    _write_config(STATION_CONFIG_PATH, config)


def get_station_config():
    """Gets the full station configuration.

    Returns:
        dict: The full station configuration.
    """
    config = _load_config(STATION_CONFIG_PATH)
    return config


def save_station_config(config):
    """Writes the full station configuration to the config file.

    Args:
        config (dict): The station configuration to save.

    Raises:
        ValueError: If the config is not a dictionary.

    Returns:
        bool: True if the config was saved successfully, False otherwise.
    """
    if not isinstance(config, dict):
        raise ValueError("Config must be a dictionary.")

    try:
        _write_config(STATION_CONFIG_PATH, config)
        return True
    except Exception as e:
        print(f"Error saving station config: {e}")
        return False


def get_static_config():
    """Get the full static configuration.

    Returns:
        dict: The full static configuration.
    """
    config = _load_config(STATIC_CONFIG_PATH)
    return config



# Helper functions to load and write the YAML configuration files
def _load_config(file_path):
    """Loads a YAML configuration data from a file.

    Args:
        file_path (str): The path to the YAML file.

    Returns:
        dict: The loaded configuration data.
    """
    with open(file_path, "r") as file:
        return yaml.safe_load(file)
    
    
def _write_config(file_path, data):
    """Writes configuration data to a YAML file.

    Args:
        file_path (str): The path to the YAML file.
        data (dict): The configuration data to write.
    """
    with open(file_path, "w") as file:
        yaml.safe_dump(data, file)
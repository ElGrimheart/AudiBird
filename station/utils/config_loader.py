import yaml

def load_yaml_config(file_path):
    """Loads a YAML configuration data from a file."""
    with open(file_path, "r") as file:
        return yaml.safe_load(file)
import yaml

def load_yaml_config(file_path):
    """Loads a YAML configuration data from a file."""
    with open(file_path, "r") as file:
        return yaml.safe_load(file)
    
def write_yaml_config(file_path, data):
    """Writes configuration data to a YAML file."""
    with open(file_path, "w") as file:
        yaml.safe_dump(data, file)
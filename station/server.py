import os
from flask import Flask, send_from_directory, abort
from utils.config_loader import load_yaml_config

app = Flask(__name__)

local_config = load_yaml_config('config/local_config.yaml')

@app.route('/recordings/<path:filename>')
def serve_audio(filename):
    file_path = filename

    if not os.path.exists(file_path):
        abort(404, description=f"File {filename} not found.")

    # Send the file directly
    return send_from_directory(os.path.dirname(file_path), os.path.basename(file_path))

app.run(host="0.0.0.0", port=4000)
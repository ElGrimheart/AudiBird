import os
from flask import Flask, send_from_directory, abort
from utils.config_loader import load_yaml_config

app = Flask(__name__)

@app.route('/recordings/<path:filename>')
def serve_audio(filepath):
    file_name = os.path.basename(filepath)
    file_dir = os.path.dirname(filepath)

    if not os.path.exists(filepath):
        abort(404, description=f"File {filepath} not found.")

    return send_from_directory(file_dir, file_name)

app.run(host="0.0.0.0", port=4000)
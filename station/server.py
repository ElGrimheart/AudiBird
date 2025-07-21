import os
from flask import Flask, send_from_directory, abort

app = Flask(__name__)

@app.route('/recordings/<path:file_path>')
def serve_audio(file_path):
    file_dir = os.path.dirname(file_path)
    file_name = os.path.basename(file_path)

    if not os.path.exists(file_path):
        abort(404, description=f"File {file_path} not found.")

    return send_from_directory(file_dir, file_name)

app.run(host="0.0.0.0", port=4000)
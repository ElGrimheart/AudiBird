import os
from flask import Flask, send_from_directory, abort

class AudioServer:
    def __init__(self, config):
        self.app = Flask(__name__)
        self.host = config.get("host", "0.0.0.0")
        self.port = config.get("port", 4000)
        self.recordings_dir = config.get("recordings_dir", "data/segments")

        @self.app.route('/recordings/<path:file_name>')
        def serve_audio(file_name):
            file_path = os.path.join(self.recordings_dir, file_name)

            if not os.path.exists(file_path):
                abort(404, description=f"File {file_path} not found.")

            return send_from_directory(self.recordings_dir, file_name)

    def start(self):
        self.app.run(host=self.host, port=self.port)
        
        
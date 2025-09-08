# Entry point for the Flask API. Launches the server and station startup service.
import os
from flask import Flask
import threading
from api.routes import station_bp
from api.services.startup_service import station_startup
from utils.station_logger import station_logger
from dotenv import load_dotenv
load_dotenv()


"""
Launches the Flask server and initializes the station startup process.

Server listens for incoming requests for starting/stopping the the detection process, 
receiving updated station configurations, and fetching/deleting audio files.

Endpoints are defined in api/routes/station_routes.py
"""

def start_server():
    # Initialize station logger
    station_logger()

    # Create Flask server and configure the routes
    app = Flask(__name__)
    app.register_blueprint(station_bp)

    # Start the station initialization thread
    threading.Thread(target=station_startup, daemon=True).start()

    # Start the Flask server
    app.run(
        host=os.environ.get("FLASK_SERVER_HOST"),
        port=os.environ.get("FLASK_SERVER_PORT")
    )
    print(f"Server running on {os.environ.get('FLASK_SERVER_HOST')}:{os.environ.get('FLASK_SERVER_PORT')}")
    print("Press Ctrl+C to stop the server.")

if __name__ == '__main__':
    start_server()
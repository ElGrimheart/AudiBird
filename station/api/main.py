# Main entry point for the application. 
# Launches the Flask server and initializes the station in a separate thread.
import os
from flask import Flask
import threading
from api.routes import station_bp
from api.services.startup_service import station_startup
from dotenv import load_dotenv
load_dotenv()

if __name__ == '__main__':

    # Creating Flask and configuring the routes
    app = Flask(__name__)
    app.register_blueprint(station_bp)

    # Starting station initialization thread
    threading.Thread(target=station_startup, daemon=True).start()

    # Starting Flask server
    app.run(
        host=os.environ.get("FLASK_SERVER_HOST"),
        port=os.environ.get("FLASK_SERVER_PORT")
    )
    print(f"Server running on {os.environ.get('FLASK_SERVER_HOST')}:{os.environ.get('FLASK_SERVER_PORT')}")
    print("Press Ctrl+C to stop the server.")
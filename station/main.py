from controllers.detection_controller import DetectionController
import sounddevice as sd
print(sd.query_devices())

detection_controller = DetectionController()
detection_controller.start()

# Prevent main thread from exiting
import time
while True:
    time.sleep(1)
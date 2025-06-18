import os
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer
from datetime import datetime

analyzer = Analyzer()

recording = Recording(
    analyzer,
    os.path.join(os.path.dirname(__file__), "..", "samples", "western_meadowlark.mp3"),
    lat = 47.0400,
    lon = -103.3700,
    date=datetime(year=2023, month=10, day=1),
    min_conf=0.25,
)

recording.analyze()
print(recording.detections)

print(recording)


recording_2 = Recording(
    analyzer,
    os.path.join(os.path.dirname(__file__), "..", "samples", "sandhill_crane.mp3"),
    lat = 40.919398779165,
    lon = -77.81975871931,
    date=datetime(year=2023, month=10, day=1),
    min_conf=0.25,
)

recording_2.analyze()
print(recording_2.detections)




recording_3 = Recording(
    analyzer,
    os.path.join(os.path.dirname(__file__), "..", "samples", "sandemar_reserve.mp3"),
    lat = 59.12,
    lon =  18.37,
    date=datetime(year=2023, month=10, day=1),
    min_conf=0.25,
)

recording_3.analyze()
print(recording_3.detections)
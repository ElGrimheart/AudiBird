""" 
Unit test for analysing the control_sample.wav file and logging results to a CSV file.

Analyses an audio recording made using a phone microphone at a distance of 10m from the control sample.
Used to compare BirdNet detections output when using different microphone types 

- see: 
tests/birdnet_validation/test_control_sample_uk.py and,
tests/birdnet_validation/test_control_sample_pi_mic.py 

and associated output logs to compare difference in detection output when using different microphone types.

"""

import csv
import os
import pytest
from station.detection.analyser.analyser import Analyser

@pytest.mark.parametrize("audio_file", [
    "tests/audio_samples/Audibird_control_sample_10m_distance_phone_mic.wav"
])

def test_analyse_full_recording_and_log(audio_file):
    config = {
        "lat": 54.607868,
        "lon": -5.926437,
        "birdnet_min_confidence": 0.25,
        "sensitivity": 1.0,
        "segments_dir": "tests/audio_samples"
    }
    analyser = Analyser(config)
    detections = analyser._analyse_full_recording(audio_file)

    # log results 
    log_path = "tests/logs/control_sample_detections_phone_mic_10m_distance.csv"
    with open(log_path, "w", newline="") as csvfile:
        detection_values = ["common_name", "scientific_name", "confidence", "timestamp"]
        writer = csv.DictWriter(csvfile, fieldnames=detection_values)
        writer.writeheader()
        for detection in detections:
            writer.writerow({
                "common_name": detection.get("common_name"),
                "scientific_name": detection.get("scientific_name"),
                "confidence": detection.get("confidence")
            })

    # Assert that detections were found and log file was written
    assert os.path.exists(log_path)
    assert len(detections) > 0
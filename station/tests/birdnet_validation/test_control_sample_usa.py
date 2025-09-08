""" 
Unit test for analysing the control_sample.wav file and logging results to a CSV file.

This test case uses USA location coordinates (27.994402, -81.760254) within the BirdNET analyser
configuration.

Validates that the analyser processes the audio file and that detections are logged.

Can be used to compare BirdNet detections output when using different geographical
locations - see tests/birdnet_validation/test_control_sample_uk.py for outputs
when using a UK location.

"""


import csv
import os
import pytest
from station.detection.analyser.analyser import Analyser

@pytest.mark.parametrize("audio_file", [
    "tests/audio_samples/Audibird_control_sample.wav"
])

def test_analyse_full_recording_and_log(audio_file):
    config = {
        "lat": 27.994402,
        "lon": -81.760254,
        "birdnet_min_confidence": 0.25,
        "sensitivity": 1.0,
        "segments_dir": "tests/audio_samples"
    }
    analyser = Analyser(config)
    detections = analyser._analyse_full_recording(audio_file)

    # log results 
    log_path = "tests/logs/control_sample_detections_usa.csv"
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

    # check that detections were output to log file
    assert os.path.exists(log_path)
    assert len(detections) > 0
import subprocess
import os
import sys

# Get the parent directory of your project
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
birdnet_path = os.path.join(parent_dir, "BirdNET-Analyzer")

# Use the current Python executable (from your venv)
python_exe = sys.executable

cmd = [
    python_exe, "-m", "birdnet_analyzer.analyze",
    "c:/Users/fresh/Documents/AudioBirder/station/data/segments/2025-06-25_12-17-27.wav",  # INPUT first
    "--min_conf", "0.01",
    "--top_n", "5",
    "-o", "c:/Users/fresh/Documents/AudioBirder/station/data/detections",
    "--rtype", "csv"
]

result = subprocess.run(cmd, cwd=birdnet_path, capture_output=True, text=True)
print("Output:", result.stdout)
if result.stderr:
    print("Errors:", result.stderr)
print("Return code:", result.returncode)
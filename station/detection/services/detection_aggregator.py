
import os
from pathlib import Path
import numpy as np
import soundfile as sf
from datetime import datetime, timezone, timedelta

class DetectionAggregator:
    """Aggregates consecutive detections of the same species into one longer detection event."""

    def __init__(self, config):
        self._output_dir = config.get("recordings_dir", "data/recordings")
        self._sample_rate = config.get("sample_rate", 48000)
        self._segment_overlap = config.get("segment_overlap", 2)

    def aggregate(self, detections):
        """
        Merges consecutive detections of the same species and saves a combined audio file.

        Args:
            detections (list[dict]): List of detection dicts from analyse_segment().
        
        Returns:
            list[dict]: Aggregated detection events with merged metadata and combined audio.
        """

        if not detections:
            return []

        aggregated = []
        current_detection_event = [detections[0]]
        
        # Iterate through detections and group consecutive detections of same species
        for detection in detections[1:]:
            if detection["common_name"] == current_detection_event[-1]["common_name"]:  
                current_detection_event.append(detection)
            else:
                aggregated.append(self._merge_detections(current_detection_event))
                current_detection_event = [detection]

        # 
        aggregated.append(self._merge_detections(current_detection_event))

        return aggregated
    
    
    def _merge_detections(self, species_group):
        """Helper to merge buffered detections into one event."""
        if not species_group:
            return None

        common_name = species_group[0]["common_name"]
        scientific_name = species_group[0]["scientific_name"]

        # Merge alternatives across all detections and keep the highest confidence
        alternatives_species = {}
        for detection in species_group:
            for alt_species in detection["alternatives"]:
                key = (alt_species["common_name"], alt_species["scientific_name"])
                if key not in alternatives_species or alt_species["confidence"] > alternatives_species[key]:
                    alternatives_species[key] = alt_species["confidence"]

        # Build combined alternatives list
        merged_alternatives = [
            {
                "common_name": common_name,
                "scientific_name": scientific_name,
                "confidence": confidence
            }
            for (common_name, scientific_name), confidence in alternatives_species.items()
        ]

        # Collect segment file names for later deletion
        segment_filenames = [detection["segment_filename"] for detection in species_group]

        # Concatenate audio segments into one recording file without overlap
        merged_audio = self._merge_audio_segments([detection["segment_filename"] for detection in species_group])
        combined_audio_length = len(merged_audio) / self._sample_rate
        combined_audio_filename, combined_audio_filesize = self._save_merged_audio(merged_audio, combined_audio_length)

        return {
            "common_name": common_name,
            "scientific_name": scientific_name,
            "confidence": max(det["confidence"] for det in species_group),  # highest confidence
            "timestamp": species_group[0]["timestamp"],
            "alternatives": merged_alternatives,
            "recording_filename": combined_audio_filename,
            "duration": combined_audio_length,
            "filesize": combined_audio_filesize,
            "segment_filenames": segment_filenames,
        }

    def _merge_audio_segments(self, segment_files):
        """
        Concatenates audio segments, removing overlap between consecutive segments.
        Args:
            segment_files (list[str]): List of audio file paths.
        Returns:
            np.ndarray: The merged audio data.
        """
        audio_data = []
        overlap_samples = None

        for i, file in enumerate(segment_files):
            data, sample_rate = sf.read(file)
            if overlap_samples is None:
                overlap_samples = int(self._segment_overlap * sample_rate)
            if i == 0:
                audio_data.append(data)
            else:
                audio_data.append(data[overlap_samples:])
        return np.concatenate(audio_data)

    def _save_merged_audio(self, audio_data, duration_seconds):
        """
        Saves the merged audio data to disk and returns the filename.

        Returns:
            tuple: The filename and filesize of the saved audio.
        """
        event_start_time = datetime.now(timezone.utc) - timedelta(seconds=duration_seconds)
        filename = f"{event_start_time.strftime('%Y%m%d_%H%M%S_%f')}.wav"
        path = os.path.join(self._output_dir, filename)
        sf.write(path, audio_data, self._sample_rate)
        filesize = os.path.getsize(path)
        return filename, filesize
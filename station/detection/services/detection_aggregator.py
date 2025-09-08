
import os
import numpy as np
import soundfile as sf
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)

class DetectionAggregator:
    """
    Aggregates consecutive detections of the same species into one detection event

    Including combining the separate audio segments (removing any overlap) and merging the
    alternative species list from each individual detection.

    Attributes:
        _output_dir (str): Directory for saving audio recordings. Defaults to "data/recordings" if none provided
        _sample_rate (int): Sample rate for audio recordings. Defaults to 48000 if none provided
        _segment_overlap (int): Overlap duration (in seconds) for audio segments. Defaults to 2 secs if none provided
    """

    OUTPUT_DIR_DEFAULT = "data/recordings"
    SAMPLE_RATE_DEFAULT = 48000
    SEGMENT_OVERLAP_DEFAULT = 2
    
    SAMPLE_RATE_MIN = 8000
    SAMPLE_RATE_MAX = 192000

    def __init__(self, config):
        """
        Instantiates the DetectionAggregator with the provided configuration.
        
        Args:
            config (dict): Configuration dictionary with keys:
                - recordings_dir (str): Directory for saving audio recordings.
                - sample_rate (int): Sample rate for audio recordings.
                - segment_overlap (int): Overlap duration (in seconds) for audio segments.
        
        Raises:
            TypeError: If config is not a dictionary.
            ValueError: If any of the config values are invalid.
        """
        if not isinstance(config, dict):
            raise TypeError("config must be a dictionary")
        
        output_dir = config.get("recordings_dir", DetectionAggregator.OUTPUT_DIR_DEFAULT)
        sample_rate = config.get("sample_rate", DetectionAggregator.SAMPLE_RATE_DEFAULT)
        segment_overlap = config.get("segment_overlap", DetectionAggregator.SEGMENT_OVERLAP_DEFAULT)

        # Validate config parameters
        if not os.path.exists(output_dir):
            logger.info(f"Creating output directory at '{output_dir}'")
            os.makedirs(output_dir, exist_ok=True)
        if not os.path.isdir(output_dir):
            logger.error(f"Output directory '{output_dir}' is not a directory")
            raise TypeError(f"Output directory '{output_dir}' is not a directory")

        if not (self.SAMPLE_RATE_MIN <= sample_rate <= self.SAMPLE_RATE_MAX):
            logger.error(f"Invalid sample_rate value. sample_rate must be between {self.SAMPLE_RATE_MIN} and {self.SAMPLE_RATE_MAX}")
            raise ValueError(f"sample_rate must be between {self.SAMPLE_RATE_MIN} and {self.SAMPLE_RATE_MAX}")
        
        if not isinstance(segment_overlap, int) or segment_overlap < 0:
            logger.error("segment_overlap must be a non-negative integer")
            raise ValueError("segment_overlap must be a non-negative integer")

        # Assign to instance variables
        self._output_dir = output_dir
        self._sample_rate = sample_rate
        self._segment_overlap = segment_overlap
        
        logger.info(f"DetectionAggregator initialized with output_dir='{self._output_dir}', sample_rate={self._sample_rate}, segment_overlap={self._segment_overlap}")


    def aggregate(self, detections):
        """
        Merges consecutive detections of the same species and saves a combined audio file.

        Args:
            detections (list[dict]): List of detection dicts from analyse_segment().
        
        Returns:
            list[dict]: Aggregated detection events with merged metadata and combined audio.
            
        Raises:
            TypeError: If the detections dict is invalid.
        """

        if not detections:
            logger.info("No detections to aggregate")
            return []
        
        if not isinstance(detections, list):
            logger.error("detections must be a list")
            raise TypeError("detections must be a list")


        aggregated = []
        current_detection_event = [detections[0]]

        # Iterate through detections. If species is same as last detection, append to current event.
        # If species changes, merge current event and start a new one.
        for detection in detections[1:]:
            if detection["common_name"] == current_detection_event[-1]["common_name"]:  
                current_detection_event.append(detection)
            else:
                aggregated.append(self._merge_detections(current_detection_event))
                current_detection_event = [detection]


        # Merge the last buffered detections
        aggregated.append(self._merge_detections(current_detection_event))

        logger.info(f"Aggregated {len(detections)} detections into detection event: {aggregated[-1]}")
        return aggregated
    
    
    def _merge_detections(self, species_group):
        """
        Helper to merge buffered detections into one event.
        
        Args:
            species_group (list[dict]): List of detection dicts to merge.
            
        Returns:
            dict: Merged detection event. Containing:
            - common_name
            - scientific_name
            - confidence
            - timestamp
            - alternatives
            - recording_filename
            - duration
            - filesize
            - segment_filenames

        Raises:
            TypeError: If the species_group dict is invalid.
        """
        if not species_group:
            logger.info("No detections to merge")
            return None
        
        if not isinstance(species_group, list) or not species_group:
            logger.error("species_group must be a non-empty list")
            raise ValueError("species_group must be a non-empty list")

        common_name = species_group[0]["common_name"]
        scientific_name = species_group[0]["scientific_name"]

        # Merge alternatives species lists from each detection (keeping the highest confidence value)
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
            
        Raises:
            TypeError: 
            - If segment_files is not a list.
            - If any element in segment_files is not a string.
            FileNotFoundError:
            - If any segment file does not exist.
        """
        if not isinstance(segment_files, list):
            logger.error("segment_files must be a list")
            raise TypeError("segment_files must be a list")
        
        for file in segment_files:
            if not isinstance(file, str):
                logger.error("Each segment file must be a string")
                raise TypeError("Each segment file must be a string")
            if not os.path.isfile(file):
                logger.error(f"Segment file '{file}' does not exist")
                raise FileNotFoundError(f"Segment file '{file}' does not exist")


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
        
        Raises:
            TypeError: If audio_data is not a numpy.ndarray.  
        """
        if not isinstance(audio_data, np.ndarray):
            raise TypeError("audio_data must be a numpy.ndarray")
        
        event_start_time = datetime.now(timezone.utc) - timedelta(seconds=duration_seconds)
        filename = f"{event_start_time.strftime('%Y%m%d_%H%M%S_%f')}.wav"
        path = os.path.join(self._output_dir, filename)
        
        sf.write(path, audio_data, self._sample_rate)
        filesize = os.path.getsize(path)
        
        return filename, filesize
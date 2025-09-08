import queue
from pathlib import Path
from datetime import datetime, timezone
import logging
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer as BirdnetAnalyzer

logger = logging.getLogger(__name__)

class Analyser:
    """Analyser class for analysing audio segments via BirdNET.

    Handles the analysis of audio segments using the BirdNET model.
    Audio segments are passed to the analyser via the `add_segment` method and processed in the 
    order they are received.

    A default min_confidence of 0.1 is applied to the BirdNet analysis to allow all potential BirdNet 
    species predictions to be returned for each segment, which are used to generate an alternative
    species list for any detection.
    
    The user_min_confidence is then applied to filter out any detections that do not meet the user's criteria.

    Methods:
    - analyse_segment(filename, top_n=5): Analyses a single audio segment file and returns detections.
    - add_segment(filename): Adds a segment filename to the analysis queue.
    - start(): Continuously processes segments from the analysis queue.
    - stop(): Stops the analyser from processing segments.
    """
    SEGMENTS_DIR_DEFAULT = "data/segments"
    BIRDNET_MIN_CONFIDENCE_DEFAULT = 0.1
    BIRDNET_SENSITIVITY_DEFAULT = 1.5
    BIRDNET_USER_MIN_CONFIDENCE_DEFAULT = 0.25

    LAT_MIN = -90.0
    LAT_MAX = 90.0
    LON_MIN = -180.0
    LON_MAX = 180.0
    ANALYSER_CONFIDENCE_MIN = 0.1
    ANALYSER_CONFIDENCE_MAX = 1.0
    SENSITIVITY_MIN = 0.5
    SENSITIVITY_MAX = 1.5
    USER_CONFIDENCE_MIN = 0.1
    USER_CONFIDENCE_MAX = 1.0

    def __init__(self, config):
        """
        Instantiates the Analyser class with the given configuration.

        Args:
            config (dict): Configuration parameters for the analyser. Supported keys:
            - 'lat' (float): Latitude for location-based analysis. 
            - 'lon' (float): Longitude for location-based analysis.
            - 'birdnet_min_confidence' (float): Minimum confidence threshold for BirdNET analysis.
            - 'sensitivity' (float): Sensitivity adjustment for BirdNET analysis.
            - 'user_min_confidence' (float): User-defined minimum confidence threshold for detections.
        
        Raises:
            TypeError:
            - If config is not a dictionary.
            - If any config parameter is of the wrong type.
            ValueError:
            - If any config parameter is out of range.
        """
        if not isinstance(config, dict):
            logger.error("config must be a dictionary")
            raise TypeError("config must be a dictionary")

        # Validate config parameters
        lat = config.get("lat", None)
        lon = config.get("lon", None)
        analyser_min_confidence = config.get("birdnet_min_confidence", self.BIRDNET_MIN_CONFIDENCE_DEFAULT)
        sensitivity = config.get("sensitivity", self.BIRDNET_SENSITIVITY_DEFAULT)
        user_min_confidence = config.get("user_min_confidence", self.BIRDNET_USER_MIN_CONFIDENCE_DEFAULT)
        segments_dir = config.get("segments_dir", self.SEGMENTS_DIR_DEFAULT)

        if lat is not None:
            if not isinstance(lat, (float, int)):
                logger.error("lat must be a float")
                raise TypeError("lat must be a float")
            if not (self.LAT_MIN <= lat <= self.LAT_MAX):
                logger.error(f"lat must be between {self.LAT_MIN} and {self.LAT_MAX}")
                raise ValueError(f"lat must be between {self.LAT_MIN} and {self.LAT_MAX}")
            
        if lon is not None:
            if not isinstance(lon, (float, int)):
                logger.error("lon must be a float")
                raise TypeError("lon must be a float")
            if not (self.LON_MIN <= lon <= self.LON_MAX):
                logger.error(f"lon must be between {self.LON_MIN} and {self.LON_MAX}")
                raise ValueError(f"lon must be between {self.LON_MIN} and {self.LON_MAX}")
            
        if not isinstance(analyser_min_confidence, (float, int)):
            logger.error("birdnet_min_confidence must be a float")
            raise TypeError("birdnet_min_confidence must be a float")
        if not (self.ANALYSER_CONFIDENCE_MIN <= analyser_min_confidence <= self.ANALYSER_CONFIDENCE_MAX):
            logger.error(f"birdnet_min_confidence must be between {self.ANALYSER_CONFIDENCE_MIN} and {self.ANALYSER_CONFIDENCE_MAX}")
            raise ValueError(f"birdnet_min_confidence must be between {self.ANALYSER_CONFIDENCE_MIN} and {self.ANALYSER_CONFIDENCE_MAX}")
        
        if not isinstance(sensitivity, (float, int)):
            logger.error("sensitivity must be a float")
            raise TypeError("sensitivity must be a float")
        if not (self.SENSITIVITY_MIN <= sensitivity <= self.SENSITIVITY_MAX):
            logger.error(f"sensitivity must be between {self.SENSITIVITY_MIN} and {self.SENSITIVITY_MAX}")
            raise ValueError(f"sensitivity must be between {self.SENSITIVITY_MIN} and {self.SENSITIVITY_MAX}")
        
        if not isinstance(user_min_confidence, (float, int)):
            logger.error("user_min_confidence must be a float")
            raise TypeError("user_min_confidence must be a float")
        if not (self.USER_CONFIDENCE_MIN <= user_min_confidence <= self.USER_CONFIDENCE_MAX):
            logger.error(f"user_min_confidence must be between {self.USER_CONFIDENCE_MIN} and {self.USER_CONFIDENCE_MAX}")
            raise ValueError("user_min_confidence must be between 0 and 1")

        # Assign to instance variables
        self._lat = lat
        self._lon = lon
        self._analyser_min_confidence = analyser_min_confidence
        self._sensitivity = sensitivity
        self._user_min_confidence = user_min_confidence
        self._birdnet_model = BirdnetAnalyzer()
        self._analysis_queue = queue.Queue()
        self._segments_dir = Path(segments_dir).resolve()
        self._running = False

        logger.info("Analyser initialized with config: %s", config)


    def analyse_segment(self, filename, top_n):
        """
        Analyses an audio segment file and returns any detections found above the user-defined 
        confidence threshold.

        Args:
            filename (str): Name of the audio segment file to analyze.
            top_n (int): Max number of detections to return for each segment.
            
        Raises:
            TypeError: If filename is not a string.
            ValueError: If top_n is not a positive integer.
        """
        if not isinstance(filename, str):
            logger.error("filename must be a string")
            raise TypeError("filename must be a string")
        
        filepath = self._segments_dir / f"{filename}.wav"
        if not filepath.exists():
            logger.error(f"Segment file {filepath} does not exist")
            raise FileNotFoundError(f"Segment file {filepath} does not exist")
        
        if not isinstance(top_n, int) or top_n <= 0:
            logger.error("top_n must be a positive integer")
            raise ValueError("top_n must be a positive integer")
        
        filepath = self._segments_dir / f"{filename}.wav"
        current_datetime = datetime.now(timezone.utc)
        
        # Analyse segment with BirdNet
        try:
            recording = Recording(
                self._birdnet_model,
                str(filepath),
                lat=self._lat,
                lon=self._lon,
                date=current_datetime,
                min_conf=self._analyser_min_confidence,
                sensitivity=self._sensitivity,
            )
            recording.analyze()
        except Exception as e:
            logger.error(f"Error during BirdNET analysis: {e}")
            return []
        
        # Sort BirdNet predictions by confidence
        sorted_predictions = sorted(
            recording.detections,
            key=lambda x: x["confidence"],
            reverse=True
        )

        # Determine if any viable detections were found, otherwise return early
        if not sorted_predictions:
            return []


        # Return early if the highest confidence detection is below the user threshold
        if sorted_predictions[0]["confidence"] < self._user_min_confidence:
            logger.info("No detections above user confidence threshold.")
            return []


        # Set primary detection
        primary_detection = sorted_predictions[0]

        # Loop through remaining detections to extract alternative species (excluding the primary detection)
        unique_species = set()
        alternative_species = []
        for alt_detection in sorted_predictions[1:]:
            key = alt_detection["common_name"]
            if key not in unique_species:
                alternative_species.append({
                    "common_name": alt_detection["common_name"],
                    "scientific_name": alt_detection["scientific_name"],
                    "confidence": alt_detection["confidence"]
                })
                unique_species.add(key)
            if len(alternative_species) >= top_n - 1:
                break


        # Compile detection dictionary
        detection = {
            "common_name": primary_detection["common_name"],
            "scientific_name": primary_detection["scientific_name"],
            "confidence": primary_detection["confidence"],
            "timestamp": current_datetime.isoformat(),
            "alternatives": alternative_species,
            "segment_filename": str(filepath)
        }
        logger.info(f"Detection: {detection}")
        
        return detection
        

    def add_segment(self, filename):
        """
        Adds a segment filename to the analysis queue.
        
        Args:
            filename (str): Name of the audio segment file to add to the queue.
            
        Raises:
            TypeError: If filename is not a string.
        """
        if not isinstance(filename, str):
            logger.error("filename must be a string")
            raise TypeError("filename must be a string")

        self._analysis_queue.put(filename)
    

    def start(self):
        """
        Continuously processes segments from the analysis queue.
        """
        self._running = True
        
        while self._running:
            try:
                filename = self._analysis_queue.get(timeout=1)
                if not self._running:
                    break

                self.analyse_segment(filename, top_n=5)  
                self._analysis_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error processing segment: {e}")


    def stop(self):
        """
        Stops the analyser from processing segments.
        """
        self._running = False
        
        
    def _analyse_full_recording(self, filepath):
        """
        Analyses a full recording file and returns all detections found

        Args:
            filepath (str): Path to the full recording file to analyze.
            
        Raises:
            TypeError: If filepath is not a string.
        """
        if not isinstance(filepath, str):
            logger.error("filepath must be a string")
            raise TypeError("filepath must be a string")
        
        if not Path(filepath).exists():
            logger.error(f"Recording file {filepath} does not exist")
            raise FileNotFoundError(f"Recording file {filepath} does not exist")
        
        current_datetime = datetime.now(timezone.utc)
        
        # Analyse segment with BirdNet
        try:
            recording = Recording(
                self._birdnet_model,
                filepath,
                lat=self._lat,
                lon=self._lon,
                date=current_datetime,
                min_conf=self._analyser_min_confidence,
                sensitivity=self._sensitivity,
            )
            recording.analyze()
        except Exception as e:
            logger.error(f"Error during BirdNET analysis: {e}")
            return []

        return recording.detections
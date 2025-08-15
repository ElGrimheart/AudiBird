import { body, validationResult } from "express-validator";

const SPECIES_REGEX = /^[A-Za-z\s-]+$/;
const DETECTION_MIN_CONFIDENCE = 0;
const DETECTION_MAX_CONFIDENCE = 1;

const STATUS_PERCENTAGE_MIN = 0;
const STATUS_PERCENTAGE_MAX = 100;

// Validates new detection posts from stations
export const validateNewDetection = [
  body('common_name')
    .exists().withMessage('Common name is required')
    .isString().withMessage('Common name must be a string')
    .custom((value) => SPECIES_REGEX.test(value)).withMessage('Common name can only contain letters, spaces and hyphens'),
  body('scientific_name')
    .exists().withMessage('Scientific name is required')
    .isString().withMessage('Scientific name must be a string')
    .custom((value) => SPECIES_REGEX.test(value)).withMessage('Scientific name can only contain letters, spaces and hyphens'),
  body('confidence')
    .exists().withMessage('Confidence is required')
    .isFloat({ min: DETECTION_MIN_CONFIDENCE, max: DETECTION_MAX_CONFIDENCE }).withMessage('Confidence must be between 0 and 1'),
  body('detection_timestamp')
    .optional()
    .custom((value) => {
        if (!value) return true; // Skip validation if null
        const detectionDate = new Date(value);
        const timeSyncBuffer = 60000;
        return detectionDate.getTime() <= Date.now() + timeSyncBuffer; // Ensure detection timestamp is not in the future
    }).withMessage('Detection timestamp cannot be in the future'),
  body('station_metadata')
    .exists().withMessage('Station metadata is required')
    .custom((value) => {
      if (typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('Station metadata must be a valid JSON object');
      }
      const { station_name, lat, lon, description } = value;
      if (!station_name || typeof station_name !== 'string') {
          throw new Error('Station name is required and must be a string');
      }
      if (typeof lat !== 'number' || typeof lon !== 'number') {
          throw new Error('Latitude and longitude must be numbers');
      }
      if (!description || typeof description !== 'string') {
          throw new Error('Description is required and must be a string');
      }
      return true;
    }),
  body('audio_metadata')
    .exists().withMessage('Audio metadata is required')
    .custom((value) => {
      if (typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('Audio metadata must be a valid JSON object');
      }
      const { duration, channels, sample_rate, sample_width, dtype } = value;
      if (typeof duration !== 'number' || duration <= 0) {
          throw new Error('Duration must be a positive number');
      }
      if (typeof channels !== 'number' || channels <= 0) {
          throw new Error('Channels must be a positive number');
      }
      if (typeof sample_rate !== 'number' || sample_rate <= 0) {
          throw new Error('Sample rate must be a positive number');
      }
      if (typeof sample_width !== 'number' || sample_width <= 0) {
          throw new Error('Sample width must be a positive number');
      }
      if (!dtype || typeof dtype !== 'string') {
          throw new Error('Data type (dtype) is required and must be a string');
      }
      return true;
    }),
  body('processing_metadata')
    .exists().withMessage('Processing metadata is required')
    .custom((value) => {
      if (typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('Processing metadata must be a valid JSON object');
      }
      const { model_name, min_confidence, segment_duration, segment_overlap } = value;
      if (!model_name || typeof model_name !== 'string') {
          throw new Error('Model name is required and must be a string');
      }
      if (typeof min_confidence !== 'number' || min_confidence < 0 || min_confidence > 1) {
          throw new Error('Minimum confidence must be between 0 and 1');
      }
      if (typeof segment_duration !== 'number' || segment_duration <= 0) {
          throw new Error('Segment duration must be a positive number');
      }
      if (typeof segment_overlap !== 'number' || segment_overlap < 0) {
          throw new Error('Segment overlap must be a non-negative number');
      }
      return true;
    }),
  body('recording_file_name')
    .exists().withMessage('Recording file name is required')
    .isString().withMessage('Recording file name must be a valid file name'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "failure",
            errors: errors.array()
        });
    }
    next();
  }
];

// Validates status update posts from stations
export const validateStatusUpdate = [
    body("is_recording")
        .exists()
        .withMessage("Recording status is required")
        .isBoolean()
        .withMessage("Recording status must be a boolean"),
    body("cpu_temp")
        .exists()
        .withMessage("CPU temperature is required")
        .isFloat()
        .withMessage("CPU temperature must be a positive number"),
    body("disk_usage")
        .exists()
        .withMessage("Disk usage percentage is required")
        .isFloat({ min: STATUS_PERCENTAGE_MIN, max: STATUS_PERCENTAGE_MAX })
        .withMessage(
            "Disk usage percentage must be a number between 0 and 100"
        ),
    body("memory_usage")
        .exists()
        .withMessage("Memory usage percentage is required")
        .isFloat({ min: STATUS_PERCENTAGE_MIN, max: STATUS_PERCENTAGE_MAX })
        .withMessage(
            "Memory usage percentage must be a number between 0 and 100"
        ),
    body("battery_level").optional(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: "failure",
                errors: errors.array(),
            });
        }
        next();
    },
];
import { param, query, body, validationResult } from 'express-validator';

const speciesRegex = /^[A-Za-z\s\-']+$/;
const confidenceMinValue = 0;
const confidenceMaxValue = 100;

// Middleware to validate detection ID format
export const validateDetectionId = [
    param('detectionId')
      .exists().withMessage('Detection ID is required')
      .isUUID().withMessage('Detection ID must be a valid UUID'),
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

export const validateDetectionFilters = [
  query('startDate')
    .optional()
    .custom((value) => value === '' || new Date(value).toString() !== 'Invalid Date')
    .withMessage('Start date must be a valid ISO8601 date'),
  query('endDate')
    .optional()
    .custom((value) => value === '' || new Date(value).toString() !== 'Invalid Date')
    .withMessage('End date must be a valid ISO8601 date')
    .custom((value) => {
        if (value === '') return true;
        const toDate = new Date(value);
        return toDate <= new Date(); // Ensure `to` date is not in the future
    })
    .withMessage('To date cannot be in the future'),
  query('speciesName')
    .optional()
    .custom((value) => value === '' || speciesRegex.test(value))
    .withMessage('Species name can only contain letters, spaces or hyphens'),
  query('minConfidence')
    .optional()
    .custom((value) => value === '' || (parseFloat(value) >= confidenceMinValue && parseFloat(value) <= confidenceMaxValue))
    .withMessage(`Minimum confidence must be between ${confidenceMinValue} and ${confidenceMaxValue}`),
  query('maxConfidence')
    .optional()
    .custom((value) => value === '' || (parseFloat(value) >= confidenceMinValue && parseFloat(value) <= confidenceMaxValue))
    .withMessage(`Maximum confidence must be between ${confidenceMinValue} and ${confidenceMaxValue}`),
  query('limit')
    .optional()
    .custom((value) => value === '' || parseInt(value) > 0)
    .withMessage('Limit must be a positive integer'),
  query('offset')
    .optional()
    .custom((value) => value === '' || parseInt(value) >= 0)
    .withMessage('Offset must be a non-negative integer'),
  query('sortOrder')
    .optional()
    .custom((value) => value === '' || ['asc', 'desc'].includes(value))
    .withMessage('Sort must be either asc or desc'),
  query('sortBy')
    .optional()
    .custom((value) => value === '' || ['detection_timestamp', 'common_name', 'confidence'].includes(value))
    .withMessage('Sort by must be a valid field'),
  query()
    .custom((_, { req }) => {
        const { startDate, endDate, minConfidence, maxConfidence } = req.query;

        // Ensure `minConfidence` is not greater than `maxConfidence`
        if (minConfidence && maxConfidence && parseFloat(minConfidence) > parseFloat(maxConfidence)) {
            throw new Error('Minimum confidence cannot be greater than maximum confidence');
        }

        // Ensure startDate is not greater than `endDate`
        if (startDate && endDate) {
              const startDateObj = new Date(startDate);
              const endDateObj = new Date(endDate);
          if (startDateObj > endDateObj) {
              throw new Error('Start date cannot be after End date');
          }
        }

        return true;
    }),
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

export const validateNewDetection = [
  body('common_name')
    .exists().withMessage('Common name is required')
    .isString().withMessage('Common name must be a string')
    .custom((value) => speciesRegex.test(value)).withMessage('Common name can only contain letters, spaces and hyphens'),
  body('scientific_name')
    .exists().withMessage('Scientific name is required')
    .isString().withMessage('Scientific name must be a string')
    .custom((value) => speciesRegex.test(value)).withMessage('Scientific name can only contain letters, spaces and hyphens'),
  body('confidence')
    .exists().withMessage('Confidence is required')
    .isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0 and 1'),
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
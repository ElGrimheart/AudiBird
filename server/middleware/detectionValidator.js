import { param, query, body, validationResult } from 'express-validator';

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
  query('from')
    .optional()
    .custom((value) => value === '' || new Date(value).toString() !== 'Invalid Date')
    .withMessage('From date must be a valid ISO8601 date'),
  query('to')
    .optional()
    .custom((value) => value === '' || new Date(value).toString() !== 'Invalid Date')
    .withMessage('To date must be a valid ISO8601 date'),
  query('species')
    .optional()
    .custom((value) => value === '' || /^[A-Za-z\s]+$/.test(value))
    .withMessage('Species can only contain letters and spaces'),
  query('min_confidence')
    .optional()
    .custom((value) => value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100))
    .withMessage('Minimum confidence must be between 0 and 100'),
  query('max_confidence')
    .optional()
    .custom((value) => value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100))
    .withMessage('Maximum confidence must be between 0 and 100'),
  query('limit')
    .optional()
    .custom((value) => value === '' || parseInt(value) > 0)
    .withMessage('Limit must be a positive integer'),
  query('offset')
    .optional()
    .custom((value) => value === '' || parseInt(value) >= 0)
    .withMessage('Offset must be a non-negative integer'),
  query('sort')
    .optional()
    .custom((value) => value === '' || ['asc', 'desc'].includes(value))
    .withMessage('Sort must be either asc or desc'),
  query('sort_by')
    .optional()
    .custom((value) => value === '' || ['detection_timestamp', 'common_name', 'confidence'].includes(value))
    .withMessage('Sort by must be a valid field'),
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

export const validateDetectionCreation = [
  body('common_name')
    .exists().withMessage('Common name is required')
    .isString().withMessage('Common name must be a string'),
  body('scientific_name')
    .exists().withMessage('Scientific name is required')
    .isString().withMessage('Scientific name must be a string'),
  body('confidence')
    .exists().withMessage('Confidence is required')
    .isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0 and 1'),
  body('detection_timestamp')
    .optional()
    .isISO8601().withMessage('Detection timestamp must be a valid ISO8601 date'),
  body('station_metadata')
    .optional()
    .isJSON().withMessage('Station metadata must be a valid JSON object'),
  body('audio_metadata')
    .optional()
    .isJSON().withMessage('Audio metadata must be a valid JSON object'),
  body('processing_metadata')
    .optional()
    .isJSON().withMessage('Processing metadata must be a valid JSON object'),
  body('audio_path')
    .exists().withMessage('Audio path is required')
    .isString().withMessage('Audio path must be a valid file path'),
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

import { param, body, validationResult } from 'express-validator';

const PERCENTAGE_MIN = 0;
const PERCENTAGE_MAX = 100;

// Middleware to validate station ID format
export const validateStationId = [
  param('stationId')
    .exists().withMessage('Station ID is required')
    .isUUID().withMessage('Station ID must be a valid UUID'),
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


export const validateStatusUpdate = [
  body('is_recording')
    .exists().withMessage('Recording status is required')
    .isBoolean().withMessage('Recording status must be a boolean'),
  body('cpu_temp')
    .exists().withMessage('CPU temperature is required')
    .isFloat().withMessage('CPU temperature must be a positive number'),
  body('disk_usage')
    .exists().withMessage('Disk usage percentage is required')
    .isFloat({ min: PERCENTAGE_MIN, max: PERCENTAGE_MAX }).withMessage('Disk usage percentage must be a number between 0 and 100'),
  body('memory_usage')
    .exists().withMessage('Memory usage percentage is required')
    .isFloat({ min: PERCENTAGE_MIN, max: PERCENTAGE_MAX }).withMessage('Memory usage percentage must be a number between 0 and 100'),
  body('battery_level')
    .optional(),
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
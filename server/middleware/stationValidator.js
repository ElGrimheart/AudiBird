import { param, validationResult } from 'express-validator';

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
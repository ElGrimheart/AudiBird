// Validation middleware to check user values submitted through client
import { query, body, validationResult } from 'express-validator';

// Permitted text patterns and field boundaries
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,}$/;
const NAME_REGEX = /^[A-Za-z ]{2,}$/;
const MIN_NAME_LENGTH = 2;
const MIN_USERNAME_LENGTH = 3;
const PASSWORD_MIN_LENGTH = 12;
const SPECIES_NAME_REGEX = /^[A-Za-z\s\-']+$/;
const CONFIDENCE_FILTER_MIN_VALUE = 0;
const CONFIDENCE_FILTER_MAX_VALUE = 100;

const STATION_TEXT_MIN_LENGTH = 2;
const STATION_TEXT_MAX_LENGTH = 100;
const STATION_TEXT_REGEX = /^[A-Za-z0-9\s\-,]+$/;
const STATION_LAT_MIN_VALUE = -90;
const STATION_LAT_MAX_VALUE = 90;
const STATION_LNG_MIN_VALUE = -180;
const STATION_LNG_MAX_VALUE = 180;
const STATION_CONFIDENCE_MIN_VALUE = 1;
const STATION_CONFIDENCE_MAX_VALUE = 100;

const USER_PREFERENCES_MIN_ALERT_THRESHOLD = 0;
const USER_PREFERENCES_MAX_ALERT_THRESHOLD = 1.0;
const USER_PREFERENCES_MAX_STORAGE_ALERT_THRESHOLD = 0.95;

// Validates login form
export const validateLoginForm = [
    body('email')
        .trim()
        .isEmail().withMessage('API: Please enter a valid email address.')
        .matches(EMAIL_REGEX).withMessage('API: Invalid email format'),
    body('password')
        .trim()
        .isLength({ min: PASSWORD_MIN_LENGTH }).withMessage(`API: Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
        .matches(/[A-Z]/).withMessage('API: Password must contain at least 1 uppercase letter')
        .matches(/[a-z]/).withMessage('API: Password must contain at least 1 lowercase letter')
        .matches(/[^A-Za-z0-9]/).withMessage('API: Password must contain at least 1 special character'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validates user registration form
export const validateUserRegistrationForm = [
    body('name')
        .trim()
        .notEmpty().withMessage('API: Name is required')
        .isLength(MIN_NAME_LENGTH).withMessage('API: Name must be at least 2 characters long')
        .matches(NAME_REGEX).withMessage('API: Name must contain only alphabetic characters and spaces'),
    body('username')
        .trim()
        .notEmpty().withMessage('API: Username is required')
        .isLength(MIN_USERNAME_LENGTH).withMessage('API: Username must be at least 3 characters long')
        .matches(USERNAME_REGEX).withMessage('API: Username must contain only alphanumeric characters and underscores'),
    body('email')
        .trim()
        .isEmail().withMessage('API: Please enter a valid email address'),
    body('password')
        .trim()
        .isLength({ min: PASSWORD_MIN_LENGTH }).withMessage(`API: Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
        .matches(/[A-Z]/).withMessage('API: Password must contain at least 1 uppercase letter')
        .matches(/[a-z]/).withMessage('API: Password must contain at least 1 lowercase letter')
        .matches(/[^A-Za-z0-9]/).withMessage('API: Password must contain at least 1 special character'),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('API: Passwords do not match');
            }
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validates detection search filters
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
    .custom((value) => value === '' || SPECIES_NAME_REGEX.test(value))
    .withMessage('Species name can only contain letters, spaces or hyphens'),
  query('minConfidence')
    .optional()
    .custom((value) => value === '' || (parseFloat(value) >= CONFIDENCE_FILTER_MIN_VALUE && parseFloat(value) <= CONFIDENCE_FILTER_MAX_VALUE))
    .withMessage(`Minimum confidence must be between ${CONFIDENCE_FILTER_MIN_VALUE} and ${CONFIDENCE_FILTER_MAX_VALUE}`),
  query('maxConfidence')
    .optional()
    .custom((value) => value === '' || (parseFloat(value) >= CONFIDENCE_FILTER_MIN_VALUE && parseFloat(value) <= CONFIDENCE_FILTER_MAX_VALUE))
    .withMessage(`Maximum confidence must be between ${CONFIDENCE_FILTER_MIN_VALUE} and ${CONFIDENCE_FILTER_MAX_VALUE}`),
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

// Validates analytics filters
export const validateAnalyticsFilters = [
    query('singleDate')
        .optional()
        .custom((value) => value === '' || new Date(value).toString() !== 'Invalid Date')
        .withMessage('Single date must be a valid ISO8601 date')
        .custom((value) => { // Ensure date is not in the future
            if (value === '') return true;
            const toSingleDate = new Date(value);
            return toSingleDate <= new Date(Date.now() + 12 * 60 * 60 * 1000); 
        })
        .withMessage('Date cannot be in the future'),
    query('startDate')
        .optional()
        .custom((value) => value === '' || new Date(value).toString() !== 'Invalid Date')
        .withMessage('Start date must be a valid ISO8601 date'),
    query('endDate')
        .optional()
        .custom((value) => value === '' || new Date(value).toString() !== 'Invalid Date')
        .withMessage('End date must be a valid ISO8601 date')
        .custom((value) => { // Ensure endDate date is not in the future
            if (value === '') return true;
            const toDate = new Date(value);
            return toDate <= new Date(Date.now() + 12 * 60 * 60 * 1000); 
        })
        .withMessage('To date cannot be in the future'),
    query('speciesName')
        .optional()
        .matches(SPECIES_NAME_REGEX)
        .withMessage('Species can only contain letters, spaces, or hyphens'),
    query('minConfidence')
        .optional()
        .custom((value) => value === '' || (parseFloat(value) >= CONFIDENCE_FILTER_MIN_VALUE && parseFloat(value) <= CONFIDENCE_FILTER_MAX_VALUE))
        .withMessage(`Minimum confidence must be between ${CONFIDENCE_FILTER_MIN_VALUE} and ${CONFIDENCE_FILTER_MAX_VALUE}`),
    query()
    .custom((_, { req }) => {
        const { startDate, endDate, minConfidence } = req.query;

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
        console.log("Validation errors:", errors.array());
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: "failure",
                errors: errors.array()
            });
        }
        next();
    }

];

// Validates station registration form
export const validateRegisterStation = [
    body("stationId")
        .exists()
        .withMessage("Station ID is required")
        .isUUID()
        .withMessage("Station ID must be a valid UUID"),
    body("stationApiKey")
        .exists()
        .withMessage("Station API key is required")
        .isUUID()
        .withMessage("Station API key must be a valid UUID"),
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

// Validates station settings form
export const validateStationSettings = [
    body("stationName")
        .exists()
        .withMessage("Station name is required")
        .isString()
        .withMessage("Station name must be a string")
        .isLength({ min: STATION_TEXT_MIN_LENGTH})
        .withMessage(`Station name must be at least ${STATION_TEXT_MIN_LENGTH} characters long`)
        .isLength({ max: STATION_TEXT_MAX_LENGTH })
        .withMessage(`Station name must be at most ${STATION_TEXT_MAX_LENGTH} characters long`)
        .matches(STATION_TEXT_REGEX)
        .withMessage("Station name can only contain letters, numbers, spaces, commas and hyphens"),
    body("lat")
        .exists()
        .withMessage("Latitude is required")
        .isFloat({ min: STATION_LAT_MIN_VALUE, max: STATION_LAT_MAX_VALUE })
        .withMessage(`Latitude must be between ${STATION_LAT_MIN_VALUE} and ${STATION_LAT_MAX_VALUE}`),
    body("lon")
        .exists()
        .withMessage("Longitude is required")
        .isFloat({ min: STATION_LNG_MIN_VALUE, max: STATION_LNG_MAX_VALUE })
        .withMessage(`Longitude must be between ${STATION_LNG_MIN_VALUE} and ${STATION_LNG_MAX_VALUE}`),
    body("locationDesc")
        .exists()
        .withMessage("Location description is required")
        .isString()
        .withMessage("Location description must be a string")
        .isLength({ min: STATION_TEXT_MIN_LENGTH })
        .withMessage(`Location description must be at least ${STATION_TEXT_MIN_LENGTH} characters long`)
        .isLength({ max: STATION_TEXT_MAX_LENGTH })
        .withMessage(`Location description must be at most ${STATION_TEXT_MAX_LENGTH} characters long`)
        .matches(STATION_TEXT_REGEX)
        .withMessage("Location description can only contain letters, numbers, spaces, and hyphens"),
    body("minConfidence")
        .exists()
        .withMessage("Minimum confidence is required")
        .isFloat({ min: STATION_CONFIDENCE_MIN_VALUE, max: STATION_CONFIDENCE_MAX_VALUE })
        .withMessage(`Minimum confidence must be between ${STATION_CONFIDENCE_MIN_VALUE} and ${STATION_CONFIDENCE_MAX_VALUE}`),
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

// Validates user preferences form
export const validateUserPreferences = [
    body('dailySummaryEmail')
        .optional()
        .isBoolean().withMessage('Daily summary email must be a boolean'),
    body('newDetectionInApp')
        .optional()
        .isBoolean().withMessage('New detection in-app must be a boolean'),
    body('newDetectionInAppThreshold')
        .optional()
        .isFloat({ min: USER_PREFERENCES_MIN_ALERT_THRESHOLD, max: USER_PREFERENCES_MAX_ALERT_THRESHOLD }).withMessage(`New detection in-app threshold must be between ${USER_PREFERENCES_MIN_ALERT_THRESHOLD} and ${USER_PREFERENCES_MAX_ALERT_THRESHOLD}`),
    body('newDetectionEmail')
        .optional()
        .isBoolean().withMessage('New detection email must be a boolean'),
    body('newDetectionEmailThreshold')
        .optional()
        .isFloat({ min: USER_PREFERENCES_MIN_ALERT_THRESHOLD, max: USER_PREFERENCES_MAX_ALERT_THRESHOLD }).withMessage(`New detection email threshold must be between ${USER_PREFERENCES_MIN_ALERT_THRESHOLD} and ${USER_PREFERENCES_MAX_ALERT_THRESHOLD}`),
    body('lowStorageEmail')
        .optional()
        .isBoolean().withMessage('Low storage email must be a boolean'),
    body('lowStorageEmailThreshold')
        .optional()
        .isFloat({ min: USER_PREFERENCES_MIN_ALERT_THRESHOLD, max: USER_PREFERENCES_MAX_STORAGE_ALERT_THRESHOLD }).withMessage(`Low storage email threshold must be between ${USER_PREFERENCES_MIN_ALERT_THRESHOLD} and ${USER_PREFERENCES_MAX_STORAGE_ALERT_THRESHOLD}`),
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

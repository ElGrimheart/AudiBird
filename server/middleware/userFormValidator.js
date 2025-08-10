import { check, query, validationResult } from 'express-validator';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
const nameRegex = /^[A-Za-z ]{2,}$/;
const minNameLength = 2;
const minUsernameLength = 3;
const speciesRegex = /^[A-Za-z\s\-']+$/;
const confidenceMinValue = 0;
const confidenceMaxValue = 100;

// Middleware to validate login form
export const validateLoginForm = [
    check('email')
        .trim()
        .isEmail().withMessage('API: Please enter a valid email address.')
        .matches(emailRegex).withMessage('API: Invalid email format'),
    check('password')
        .trim()
        .isLength({ min: 12 }).withMessage('API: Password must be at least 12 characters')
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

// Middleware to validate registration form
export const validateRegisterForm = [
    check('name')
        .trim()
        .notEmpty().withMessage('API: Name is required')
        .isLength(minNameLength).withMessage('API: Name must be at least 2 characters long')
        .matches(nameRegex).withMessage('API: Name must contain only alphabetic characters and spaces'),
    check('username')
        .trim()
        .notEmpty().withMessage('API: Username is required')
        .isLength(minUsernameLength).withMessage('API: Username must be at least 3 characters long')
        .matches(usernameRegex).withMessage('API: Username must contain only alphanumeric characters and underscores'),
    check('email')
        .trim()
        .isEmail().withMessage('API: Please enter a valid email address'),
    check('password')
        .trim()
        .isLength({ min: 12 }).withMessage('API: Password must be at least 12 characters')
        .matches(/[A-Z]/).withMessage('API: Password must contain at least 1 uppercase letter')
        .matches(/[a-z]/).withMessage('API: Password must contain at least 1 lowercase letter')
        .matches(/[^A-Za-z0-9]/).withMessage('API: Password must contain at least 1 special character'),
    check('confirmPassword')
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

// Middleware to validate analytics filters
export const validateAnalyticsFilters = [
    query('singleDate')
        .optional()
        .custom((value) => value === '' || new Date(value).toString() !== 'Invalid Date')
        .withMessage('Single date must be a valid ISO8601 date')
        .custom((value) => {
            if (value === '') return true;
            const toSingleDate = new Date(value);
            return toSingleDate <= new Date(Date.now() + 24 * 60 * 60 * 1000); // Ensure `to` date is not in the future
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
        .custom((value) => {
            if (value === '') return true;
            const toDate = new Date(value);
            return toDate <= new Date(Date.now() + 24 * 60 * 60 * 1000); // Ensure `to` date is not in the future
        })
        .withMessage('To date cannot be in the future'),
    query('speciesName')
        .optional()
        .matches(speciesRegex)
        .withMessage('Species can only contain letters, spaces, or hyphens'),
    query('minConfidence')
        .optional()
        .custom((value) => value === '' || (parseFloat(value) >= confidenceMinValue && parseFloat(value) <= confidenceMaxValue))
        .withMessage(`Minimum confidence must be between ${confidenceMinValue} and ${confidenceMaxValue}`),
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

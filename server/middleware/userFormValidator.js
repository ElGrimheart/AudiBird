import { check, validationResult } from 'express-validator';

// Middleware to validate login form
export const validateLoginForm = [
    check('email')
        .trim()
        .isEmail().withMessage('API: Please enter a valid email address.')
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage('API: Invalid email format'),
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
        .isLength({ min: 2 }).withMessage('API: Name must be at least 2 characters long')
        .matches(/^[A-Za-z\s]+$/).withMessage('API: Name must contain only alphabetic characters and spaces'),
    check('username')
        .trim()
        .notEmpty().withMessage('API: Username is required')
        .isLength({ min: 3 }).withMessage('API: Username must be at least 3 characters long')
        .matches(/^[A-Za-z0-9_]+$/).withMessage('API: Username must contain only alphanumeric characters and underscores'),
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

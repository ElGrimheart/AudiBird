import { check, validationResult } from 'express-validator';

// Middleware to validate login form
export const validateLoginForm = [
    check('email')
        .trim()
        .isEmail().withMessage('Please enter a valid email address.')
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage('Invalid email format'),
    check('password')
        .trim()
        .isLength({ min: 12 }).withMessage('Password must be at least 12 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least 1 uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least 1 lowercase letter')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least 1 special character'),
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
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long')
        .matches(/^[A-Za-z\s]+$/).withMessage('Name must contain only alphabetic characters and spaces'),
    check('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .matches(/^[A-Za-z0-9_]+$/).withMessage('Username must contain only alphanumeric characters and underscores'),
    check('email')
        .trim()
        .isEmail().withMessage('Please enter a valid email address'),
    check('password')
        .trim()
        .isLength({ min: 12 }).withMessage('Password must be at least 12 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least 1 uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least 1 lowercase letter')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least 1 special character'),
    check('confirm_password')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
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

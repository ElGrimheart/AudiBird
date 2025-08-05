/* Utility functions to validate user input values */
import * as Yup from 'yup';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
const nameRegex = /^[A-Za-z ]{2,}$/;
const registerPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/;
const minNameLength = 2;
const minUsernameLength = 3;
const speciesRegex = /^[A-Za-z\s\-']+$/;
const confidenceMinValue = 0;
const confidenceMaxValue = 100;

// Validation schema for user registration and login
export function loginRegisterSchema(isRegister) {
    return Yup.object().shape({
        name: isRegister
          ? Yup.string()
              .required('Name is required.')
              .min(minNameLength, `Name must be at least ${minNameLength} characters.`)
              .matches(nameRegex, 'Name can only contain letters and spaces.')
          : Yup.string().nullable(),
        username: isRegister
          ? Yup.string()
              .required('Username is required.')
              .min(minUsernameLength, `Username must be at least ${minUsernameLength} characters.`)
              .matches(usernameRegex, 'Username can only contain letters, numbers, and underscores.')
          : Yup.string().nullable(),
        email: Yup.string()
            .required('Email is required.')
            .matches(emailRegex, 'Please enter a valid email address.'),
        password: Yup.string()
            .required('Password is required.')
            .test(
              'password-format',
              isRegister
                  ? 'Password must contain: \n- At least 12 characters\n- At least 1 uppercase letter\n- At least 1 lowercase letter\n- At least 1 special character'
                  : 'Invalid password format.',
              (value) => {
                  if (!value) return false;
                  return registerPasswordRegex.test(value);
              }
            ),
        confirmPassword: isRegister
            ? Yup.string()
                .required('Please confirm your password.')
                .oneOf([Yup.ref('password')], 'Passwords do not match.')
            : Yup.string().nullable(),
    });
}

// Validation schema for Detections filter form
export function detectionFiltersSchema() {
    return Yup.object().shape({
        startDate: Yup.date()
            .nullable()
            .transform((value, originalValue) => (originalValue === '' ? null : value))
            .typeError('From date must be a valid ISO8601 date')
            .test('start-before-end', 'From date cannot be after To date', function (value) { // Ensure `start` is before or equal to `end` date
                const { endDate } = this.parent || {};
                if (!value || !endDate) {
                    return true; 
                }
                return new Date(value) <= new Date(endDate);
            }),
        endDate: Yup.date()
            .nullable()
            .transform((value, originalValue) => (originalValue === '' ? null : value))
            .typeError('To date must be a valid ISO8601 date')
            .test('is-not-in-future', 'To date cannot be in the future', function (value) { // Ensure `end` is not in the future
                if (!value) {
                    return true; 
                }
                return value <= new Date(); 
            }),
        speciesName: Yup.string()
          .nullable()
          .matches(speciesRegex, 'Species name can only contain letters, spaces, or hyphens'),
        minConfidence: Yup.number()
          .nullable()
          .min(confidenceMinValue, `Minimum confidence must be between ${confidenceMinValue} and ${confidenceMaxValue}`)
          .max(confidenceMaxValue, `Minimum confidence must be between ${confidenceMinValue} and ${confidenceMaxValue}`)
          .typeError('Minimum confidence must be a number'),
        maxConfidence: Yup.number()
          .nullable()
          .min(confidenceMinValue, `Maximum confidence must be between ${confidenceMinValue} and ${confidenceMaxValue}`)
          .max(confidenceMaxValue, `Maximum confidence must be between ${confidenceMinValue} and ${confidenceMaxValue}`)
          .typeError('Maximum confidence must be a number')
          .test('min-less-than-max', 'Maximum confidence cannot be less than minimum confidence', function (value) {
              const { minConfidence } = this.parent || {};            // ensure min !> max
              if (value === null || value === undefined || minConfidence === null || minConfidence === undefined) {
                  return true;
              }
              return minConfidence <= value;
          }),
        sortBy: Yup.string()
          .required('Sort by is required') // Mark as required
          .oneOf(['detection_timestamp', 'common_name', 'confidence'], 'Sort by must be a valid field'),
        
        sortOrder: Yup.string()
          .required('Sort is required') // Mark as required
          .oneOf(['asc', 'desc'], 'Sort must be either asc or desc'),
    });
}


export function analyticsFiltersSchema() {
    return Yup.object().shape({
        singleDate: Yup.date()
            .nullable(),
        startDate: Yup.date()
            .nullable()
            .test('start-before-end', 'From date cannot be after To date', function (value) { // Ensure `start` is before or equal to `end` date
                const { endDate } = this.parent || {};
                if (!value || !endDate) {
                    return true; 
                }
                return new Date(value) <= new Date(endDate);
            }),    
        endDate: Yup.date()
            .nullable()
            .test('is-not-in-future', 'To date cannot be in the future', function (value) { // Ensure `end` is not in the future
                if (!value) {
                    return true; 
                }
                return value <= new Date(); 
            }),
        species: Yup.string()
          .nullable()
          .matches(speciesRegex, 'Species name can only contain letters, spaces and hyphens'),
        minConfidence: Yup.number()
          .nullable()
          .min(confidenceMinValue, `Minimum confidence must be between ${confidenceMinValue} and ${confidenceMaxValue}`)
          .max(confidenceMaxValue, `Minimum confidence must be between ${confidenceMinValue} and ${confidenceMaxValue}`)
          .typeError('Minimum confidence must be a number')
    });
}
/* Utility functions to validate user input values using Yup */
import * as Yup from 'yup';

// Permitted login/register values
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,}$/;
const NAME_REGEX = /^[A-Za-z ]{2,}$/;
const REGISTER_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/;
const NAME_MIN_LENGTH = 2;
const USERNAME_MIN_LENGTH = 3;

// Permitted filter values
const SPECIES_NAME_REGEX = /^[A-Za-z\s\-']+$/;
const FILTER_CONFIDENCE_MIN_VALUE = 0;
const FILTER_CONFIDENCE_MAX_VALUE = 100;

// Register station values
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Permitted station settings values
const STATION_TEXT_REGEX = /^[A-Za-z0-9\s\-,.]+$/;
const STATION_TEXT_MIN_LENGTH = 2;
const STATION_TEXT_MAX_LENGTH = 100;
const STATION_LAT_MIN = -90;
const STATION_LAT_MAX = 90;
const STATION_LON_MIN = -180;
const STATION_LON_MAX = 180;
const STATION_CONFIDENCE_MIN_VALUE = 1;
const STATION_CONFIDENCE_MAX_VALUE = 100;
const STATION_MIN_STORAGE_PERCENT = 50;
const STATION_MAX_STORAGE_PERCENT = 90;

// Validation schema for user registration and login forms
export function loginRegisterSchema(isRegister) {
    return Yup.object().shape({
        name: isRegister
          ? Yup.string()
              .required('Name is required.')
              .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters.`)
              .matches(NAME_REGEX, 'Name can only contain letters and spaces.')
          : Yup.string().nullable(),
        username: isRegister
          ? Yup.string()
              .required('Username is required.')
              .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters.`)
              .matches(USERNAME_REGEX, 'Username can only contain letters, numbers, and underscores.')
          : Yup.string().nullable(),
        email: Yup.string()
            .required('Email is required.')
            .matches(EMAIL_REGEX, 'Please enter a valid email address.'),
        password: Yup.string()
            .required('Password is required.')
            .test(
              'password-format',
              isRegister
                  ? 'Password must contain: \n- At least 12 characters\n- At least 1 uppercase letter\n- At least 1 lowercase letter\n- At least 1 special character'
                  : 'Invalid password format.',
              (value) => {
                  if (!value) return false;
                  return REGISTER_PASSWORD_REGEX.test(value);
              }
            ),
        confirmPassword: isRegister
            ? Yup.string()
                .required('Please confirm your password.')
                .oneOf([Yup.ref('password')], 'Passwords do not match.')
            : Yup.string().nullable(),
    });
}

// Validation schema for RegisterSettings form
export function registerStationSchema() {
    return Yup.object().shape({
        stationId: Yup.string()
            .required('Station ID is required')
            .matches(UUID_REGEX, 'Invalid format of Station ID'),
        stationApiKey: Yup.string()
            .required('Station API Key is required')
            .matches(UUID_REGEX, 'Invalid format of Station API Key'),
    });
}

// Validation schema for StationSettings form
export function stationSettingsSchema() {
    return Yup.object().shape({
        stationName: Yup.string()
            .required('Station name is required')
            .min(STATION_TEXT_MIN_LENGTH, `Station name must be at least ${STATION_TEXT_MIN_LENGTH} characters long`)
            .max(STATION_TEXT_MAX_LENGTH, `Station name must be at most ${STATION_TEXT_MAX_LENGTH} characters long`)
            .matches(STATION_TEXT_REGEX, 'Station name can only contain letters, numbers, spaces, hypens or commas'),
        lat: Yup.number()
            .required('Latitude is required')
            .min(STATION_LAT_MIN, `Latitude must be between ${STATION_LAT_MIN} and ${STATION_LAT_MAX}`)
            .max(STATION_LAT_MAX, `Latitude must be between ${STATION_LAT_MIN} and ${STATION_LAT_MAX}`),
        lon: Yup.number()
            .required('Longitude is required')
            .min(STATION_LON_MIN, `Longitude must be between ${STATION_LON_MIN} and ${STATION_LON_MAX}`)
            .max(STATION_LON_MAX, `Longitude must be between ${STATION_LON_MIN} and ${STATION_LON_MAX}`),
        locationDesc: Yup.string()
            .required('Location description is required')
            .min(STATION_TEXT_MIN_LENGTH, `Location description must be at least ${STATION_TEXT_MIN_LENGTH} characters long`)
            .max(STATION_TEXT_MAX_LENGTH, `Location description must be at most ${STATION_TEXT_MAX_LENGTH} characters long`)
            .matches(STATION_TEXT_REGEX, 'Location description can only contain letters, numbers, spaces, hypens or commas'),
            minConfidence: Yup.number()
            .required('Minimum confidence is required')
            .min(STATION_CONFIDENCE_MIN_VALUE, `Minimum confidence must be between ${STATION_CONFIDENCE_MIN_VALUE} and ${STATION_CONFIDENCE_MAX_VALUE}`)
            .max(STATION_CONFIDENCE_MAX_VALUE, `Minimum confidence must be between ${STATION_CONFIDENCE_MIN_VALUE} and ${STATION_CONFIDENCE_MAX_VALUE}`),
        maxStoragePercent: Yup.number()
            .required('Maximum storage percent is required')
            .min(STATION_MIN_STORAGE_PERCENT, `Maximum storage percent must be between ${STATION_MIN_STORAGE_PERCENT} and ${STATION_MAX_STORAGE_PERCENT}`)
            .max(STATION_MAX_STORAGE_PERCENT, `Maximum storage percent must be between ${STATION_MIN_STORAGE_PERCENT} and ${STATION_MAX_STORAGE_PERCENT}`)
    });
}

// Validation schema for UserPreferences form
export function userPreferencesSchema() {
    return Yup.object().shape({
        dailySummaryEmail: Yup.boolean(),
        newDetectionInApp: Yup.boolean(),
        newDetectionInAppThreshold: Yup.number()
            .min(0, "Minimum confidence must be at least 0")
            .max(100, "Maximum confidence must be at most 100"),
        newDetectionEmail: Yup.boolean(),
        newDetectionEmailThreshold: Yup.number()
            .min(0, "Minimum confidence must be at least 0")
            .max(100, "Maximum confidence must be at most 100"),
        lowStorageEmail: Yup.boolean(),
        lowStorageEmailThreshold: Yup.number()
            .min(0, "Minimum storage alert must be at least 0")
            .max(95, "Maximum storage alert must be at most 95"),
    });
}

// Validation schema for Detections filter sidebar
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
          .matches(SPECIES_NAME_REGEX, 'Species name can only contain letters, spaces, or hyphens'),
        minConfidence: Yup.number()
          .nullable()
          .min(FILTER_CONFIDENCE_MIN_VALUE, `Minimum confidence must be between ${FILTER_CONFIDENCE_MIN_VALUE} and ${FILTER_CONFIDENCE_MAX_VALUE}`)
          .max(FILTER_CONFIDENCE_MAX_VALUE, `Minimum confidence must be between ${FILTER_CONFIDENCE_MIN_VALUE} and ${FILTER_CONFIDENCE_MAX_VALUE}`)
          .typeError('Minimum confidence must be a number'),
        maxConfidence: Yup.number()
          .nullable()
          .min(FILTER_CONFIDENCE_MIN_VALUE, `Maximum confidence must be between ${FILTER_CONFIDENCE_MIN_VALUE} and ${FILTER_CONFIDENCE_MAX_VALUE}`)
          .max(FILTER_CONFIDENCE_MAX_VALUE, `Maximum confidence must be between ${FILTER_CONFIDENCE_MIN_VALUE} and ${FILTER_CONFIDENCE_MAX_VALUE}`)
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

// Validation schema for Analytics filters
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
                return value <= new Date(Date.now() + 24 * 60 * 60 * 1000); 
            }),
        speciesName: Yup.string()
          .nullable()
          .matches(SPECIES_NAME_REGEX, 'Species name can only contain letters, spaces and hyphens'),
        minConfidence: Yup.number()
          .nullable()
          .min(FILTER_CONFIDENCE_MIN_VALUE, `Minimum confidence must be between ${FILTER_CONFIDENCE_MIN_VALUE} and ${FILTER_CONFIDENCE_MAX_VALUE}`)
          .max(FILTER_CONFIDENCE_MAX_VALUE, `Minimum confidence must be between ${FILTER_CONFIDENCE_MIN_VALUE} and ${FILTER_CONFIDENCE_MAX_VALUE}`)
          .typeError('Minimum confidence must be a number')
    });
}
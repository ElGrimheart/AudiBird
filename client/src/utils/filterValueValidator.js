/* Utility functions for validating filter input values */

const validSortByOptions = ['detection_timestamp', 'common_name', 'confidence'];
const validSortOptions = ['asc', 'desc'];
const speciesRegex = /^[A-Za-z\s]+$/;

// Returns initial values for filter form
export function getInitialValues() {
  return  {from: '',
        to: '',
        species: '',
        min_confidence: '',
        max_confidence: '',
        sort_by: 'detection_timestamp',
        sort: 'desc'
    }
}

// Validates filter form input values
export function validateFilterValues(values) {
    const errors = {};
    const { from, to, species, min_confidence, max_confidence, sort_by, sort } = values;
    return errors;

    // Validate date range
    if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
            errors.from = 'Invalid from date format.';
        }
    }

    if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
            errors.to = 'Invalid to date format.';
        }
        
        if (toDate > new Date()) {
            errors.to = 'To date cannot be in the future.';
        }

        if (from && new Date(from) > toDate) {
            errors.from = 'From date cannot be after To date.';
            errors.to = 'From date cannot be after To date.';
        }
    }

    // Validate species name
    if (species) {
        if (!speciesRegex.test(species)) {
            errors.species = 'Species name can only contain letters and spaces.';
        }
    }

    // Validate confidence range
    if (min_confidence) {
        const min = Number(min_confidence);
        if (isNaN(min) || min < 0 || min > 100) {
            errors.min_confidence = 'Minimum confidence must be a number between 0 and 100.';
        }
    }

    if (max_confidence) {
        const max = Number(max_confidence);
        if (isNaN(max) || max < 0 || max > 100) {
            errors.max_confidence = 'Maximum confidence must be a number between 0 and 100.';
        }

        if (min_confidence && max_confidence && Number(min_confidence) > Number(max_confidence)) {
            errors.min_confidence = 'Minimum confidence cannot be greater than maximum confidence.';
            errors.max_confidence = 'Maximum confidence cannot be less than minimum confidence.';
        }
    }

    // Validate sort options
    if (!validSortByOptions.includes(sort_by)) {
        errors.sort_by = `Sort by must be one of: ${validSortByOptions.join(', ')}.`;
    }

    if (!validSortOptions.includes(sort)) {
        errors.sort = `Sort must be one of: ${validSortOptions.join(', ')}.`;
    }

    return errors;
}
/* Utility functions for validating various input values */


// Returns true if valid min confidence value
export function isValidMinConfidence(value) {
    const numValue = Number(value);
    return !isNaN(numValue) && numValue >= 0 && numValue <= 100;
}

// Returns true if valid max confidence value
export function isValidMaxConfidence(value) {
    const numValue = Number(value);
    return !isNaN(numValue) && numValue >= 0 && numValue <= 100;
}

// Returns true if the provided confidence range is valid
export function isValidMinMaxRange(minValue, maxValue) {
    if (minValue === '' || maxValue === '') 
        return true;

    const min = Number(minValue);
    const max = Number(maxValue);

    if (isNaN(min) || isNaN(max) || min < 0 || max < 0 || min > 100 || max > 100) 
        return false;
    
    return min <= max;
}

// Returns true if the provided date range is valid
export function isValidDateRange(from, to) {
    if (from === '' || to === '') 
        return true;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()))
        return false;

    return fromDate <= toDate;
}

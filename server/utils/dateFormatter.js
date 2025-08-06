// Helper functions for date normalization

// Normalizes a date to the start of the day and returns ISO string
export function normaliseDateToStartOfDay(date) {
    if (!date) return null; 
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized.toISOString();
}

// Normalizes a date to the end of the day and returns ISO string
export function normaliseDateToEndOfDay(date) {
    if (!date) return null;
    const normalized = new Date(date);
    normalized.setHours(23, 59, 59, 999);
    return normalized.toISOString();
}
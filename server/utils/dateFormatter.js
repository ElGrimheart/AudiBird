// Helper functions for date normalization

// Normalizes a date to the start of the day and returns the UTC ISO string
export function normaliseDateToStartOfDay(date) {
    if (!date) return null;
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
}

// Normalizes a date to the end of the day and returns the UTC ISO string
export function normaliseDateToEndOfDay(date) {
    if (!date) return null;
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d.toISOString();
}
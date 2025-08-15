/* Utility functions to format dates and strings for display */

// Formats an ISO date string to a DD MONTH YYYY HH:MM:SS format
export function formatStringToDate(isoString) {
    if (!isoString) 
        return "";

    const fullDate = new Date(isoString);
    
    const date = fullDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
    const time = fullDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
    return `${date} ${time}`;
}

// Converts a date string to a Date object
export function formatDateToString(date) {
    if (!(date instanceof Date)) 
        return "";

    return date.toISOString();
}

// Converts a Date object to a date input value format (YYYY-MM-DD)
export function formatHtmlInputToDate(date) {
    if (!date) 
        return "";

    const dateIso = (date instanceof Date) ? date : new Date(date);
    return dateIso.toISOString().slice(0, 10);
}


export function formatHtmlDateToUTC(date) {
    if (!date)
        return "";

    const dateUTC = new Date(date);
    return dateUTC.toISOString()+"T00:00:00Z";
}
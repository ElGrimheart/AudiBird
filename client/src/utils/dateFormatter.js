/* Utility functions to format dates and strings for display */

// Formats an ISO date string to a DD MONTH YYYY HH:MM:SS format
export const formatStringToDate = (isoString) => {
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
    };

    
// Converts a date string to a Date object
export const formatDateToString = (date) => {
    if (!(date instanceof Date)) 
        return "";

    return date.toISOString();
}

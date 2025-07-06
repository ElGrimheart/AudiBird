const formatStringToDate = (isoString) => {
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

const formatDateToString = (date) => {
    if (!(date instanceof Date)) 
        return "";

    return date.toISOString();
}

export { formatStringToDate, formatDateToString };

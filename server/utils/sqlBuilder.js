// Utility class for constructing SQL queries for detection data

// Builds a WHERE clause based on the filters passed
export function buildDetectionWhereClause(stationId, { from, to, species, minConfidence, maxConfidence }) {
    const filters = [];
    const values = [stationId];

    let whereClause = 'WHERE station_id = $1';

    if (from) {
        values.push(from);
        filters.push(`detection_timestamp >= $${values.length}`);
    }
    if (to) {
        values.push(to);
        filters.push(`detection_timestamp <= $${values.length}`);
    }
    if (species) {
        values.push(`%${species}%`);
        filters.push(`(common_name ILIKE $${values.length} OR scientific_name ILIKE $${values.length})`);
    }
    if (minConfidence !== undefined && minConfidence !== '' && !isNaN(Number(minConfidence))) {
        values.push(Number(minConfidence) / 100);
        filters.push(`confidence >= $${values.length}`);
    }
    if (maxConfidence !== undefined && maxConfidence !== '' && !isNaN(Number(maxConfidence))) {
        values.push(Number(maxConfidence) / 100);
        filters.push(`confidence <= $${values.length}`);
    }
    if (filters.length > 0) {
        whereClause += ' AND ' + filters.join(' AND ');
    }

    return { whereClause, values };
}

// Builds an ORDER BY clause based on the parameters passed
export function buildDetectionSortClause(sortBy, sortOrder, allowedColumns = ['detection_timestamp', 'confidence', 'common_name', 'scientific_name'], defaultColumn = 'detection_timestamp') {
    let sortByArr = sortBy ? sortBy.split(',') : [defaultColumn];
    let sortDirArr = sortOrder ? sortOrder.split(',') : ['desc'];
    const orderByParts = sortByArr.map((col, i) => {
        const column = allowedColumns.includes(col) ? col : defaultColumn;
        const dir = (sortDirArr[i] || sortDirArr[0] || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        return `${column} ${dir}`;
    });
    return orderByParts.length ? `ORDER BY ${orderByParts.join(', ')}` : '';
}
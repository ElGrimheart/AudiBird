// Utility class for constructing SQL queries for detection data

// Builds a WHERE clause based on provided filters
export function buildDetectionWhereClause(stationId, { from, to, species, min_confidence, max_confidence }) {
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
    if (min_confidence !== undefined && min_confidence !== '' && !isNaN(Number(min_confidence))) {
        values.push(Number(min_confidence) / 100);
        filters.push(`confidence >= $${values.length}`);
    }
    if (max_confidence !== undefined && max_confidence !== '' && !isNaN(Number(max_confidence))) {
        values.push(Number(max_confidence) / 100);
        filters.push(`confidence <= $${values.length}`);
    }
    if (filters.length > 0) {
        whereClause += ' AND ' + filters.join(' AND ');
    }

    return { whereClause, values };
}

// Builds an ORDER BY clause based on provided parameters
export function buildDetectionSortClause(sort_by, sort, allowedColumns = ['detection_timestamp', 'confidence', 'common_name', 'scientific_name'], defaultColumn = 'detection_timestamp') {
    let sortByArr = sort_by ? sort_by.split(',') : [defaultColumn];
    let sortDirArr = sort ? sort.split(',') : ['desc'];
    const orderByParts = sortByArr.map((col, i) => {
        const column = allowedColumns.includes(col) ? col : defaultColumn;
        const dir = (sortDirArr[i] || sortDirArr[0] || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        return `${column} ${dir}`;
    });
    return orderByParts.length ? `ORDER BY ${orderByParts.join(', ')}` : '';
}
// Utility class for constructing SQL queries for detection data
const ALLOWABLE_COLUMNS = ['detection_timestamp', 'confidence', 'common_name', 'scientific_name'];
const DEFAULT_SORT_COLUMN = 'detection_timestamp';


// Builds a WHERE clause depending on the filters provided
export function buildDetectionWhereClause(stationId, { singleDate, startDate, endDate, speciesName, speciesCode, minConfidence, maxConfidence, verificationStatusId, protectedAudio }) {
    const filters = [];
    const values = [stationId];

    let whereClause = 'WHERE station_id = $1';

    if (singleDate) {
        values.push(singleDate);
        filters.push(`DATE(detection_timestamp) = $${values.length}`);
    }

    if (startDate) {
        values.push(startDate);
        filters.push(`detection_timestamp >= $${values.length}`);
    }

    if (endDate) {
        values.push(endDate);
        filters.push(`detection_timestamp <= $${values.length}`);
    }

    if (speciesName && speciesName.trim() != "All Species") {
        values.push(`%${speciesName}%`);
        filters.push(`(common_name ILIKE $${values.length} OR scientific_name ILIKE $${values.length})`);
    }

    if (speciesCode) {
        values.push(`%${speciesCode}%`);
        filters.push(`(species_code = $${values.length})`);
    }

    if (minConfidence !== undefined && minConfidence !== '' && !isNaN(Number(minConfidence))) {
        values.push(Number(minConfidence) / 100);
        filters.push(`confidence >= $${values.length}`);
    }

    if (maxConfidence !== undefined && maxConfidence !== '' && !isNaN(Number(maxConfidence))) {
        values.push(Number(maxConfidence) / 100);
        filters.push(`confidence <= $${values.length}`);
    }

    if (verificationStatusId && verificationStatusId !== null) {
        values.push(verificationStatusId);
        filters.push(`verification_status_id = $${values.length}`);
    }

    if (protectedAudio && protectedAudio !== null) {
        values.push(protectedAudio);
        filters.push(`protected = $${values.length}`);
    }

    if (filters.length > 0) {
        whereClause += ' AND ' + filters.join(' AND ');
    }

    return { whereClause, values };
}

// Builds an ORDER BY clause based on the parameters passed
export function buildDetectionSortClause(sortBy, sortOrder) {
    
    // parse sortBy and sortOrder into arrays
    const sortByArray = sortBy ? sortBy.split(',') : [DEFAULT_SORT_COLUMN];
    const sortDirectionArray = sortOrder ? sortOrder.split(',') : ['desc'];

    // Check for valid sort columns and directions and construct the order by conditions
    const orderByConditions = sortByArray.map((column, i) => {
        const sortColumn = ALLOWABLE_COLUMNS.includes(column) ? column : DEFAULT_SORT_COLUMN;

        const tempDirection = sortDirectionArray[i] || sortDirectionArray[0] || 'desc';
        const sortDirection = tempDirection.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        return { sortColumn, sortDirection };
    });

    // Build the ORDER BY clause and return
    const orderByStatements = orderByConditions.map(item => `${item.sortColumn} ${item.sortDirection}`);

    return orderByStatements.length ? `ORDER BY ${orderByStatements.join(', ')}` : '';
}


/* Experimental: Deltas for detections, species, confidence and most common species. 
Not carried forward to production at this stage

// Builds a WHERE clause for delta filters based on the provided parameters
export function buildDeltaFilters(startIndex, { speciesName, minConfidence }) {
  const filters = [];
  const filterValues = [];
  let paramIndex = startIndex;

  if (speciesName) {
    paramIndex++;
    filterValues.push(speciesName);
    filters.push(`(common_name ILIKE $${paramIndex} OR scientific_name ILIKE $${paramIndex})`);
  }

  if (minConfidence) {
    paramIndex++;
    filterValues.push(minConfidence);
    filters.push(`AND confidence >= $${paramIndex}`);
  }

  const filterClause = filters.join(' ');

  return {
    filterClause,
    filterValues
  };
}

*/
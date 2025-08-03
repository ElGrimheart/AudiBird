import React, { useState } from 'react';
import DetectionFiltersContext from '../contexts/DetectionFiltersContext';

// FiltersProvider component to manage state of detection filters
export default function DetectionFiltersProvider({ children }) {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        speciesName: '',
        minConfidence: '',
        maxConfidence: '',
        sortBy: 'detection_timestamp',
        sortOrder: 'desc',
    });

    return (
        <DetectionFiltersContext.Provider value={{ filters, setFilters }}>
            {children}
        </DetectionFiltersContext.Provider>
    );
}
import React, { useState } from 'react';
import DetectionFiltersContext from '../contexts/DetectionFiltersContext';

// FiltersProvider component to manage detection filter state and default values
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
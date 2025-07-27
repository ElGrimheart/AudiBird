import React, { useState } from 'react';
import DetectionFiltersContext from '../contexts/DetectionFiltersContext';

// FiltersProvider component to manage state of detection filters
const DetectionFiltersProvider = ({ children }) => {
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        species: '',
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
};

export default DetectionFiltersProvider;
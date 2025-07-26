import React, { useState } from 'react';
import DetectionFiltersContext from '../contexts/DetectionFiltersContext';

// FiltersProvider component to manage state of detection filters
const DetectionFiltersProvider = ({ children }) => {
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        species: '',
        min_confidence: '',
        max_confidence: '',
        sort_by: 'detection_timestamp',
        sort: 'desc',
    });

    return (
        <DetectionFiltersContext.Provider value={{ filters, setFilters }}>
            {children}
        </DetectionFiltersContext.Provider>
    );
};

export default DetectionFiltersProvider;
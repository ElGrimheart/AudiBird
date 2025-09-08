import React, { useState } from 'react';
import DetectionFiltersContext from '../contexts/DetectionFiltersContext';
import { DEFAULT_DETECTION_FILTERS } from '../constants/detection-filters';

/*
FiltersProvider component to manage detection filter values between renders.
Contains default search parameters for initial page render
*/
export default function DetectionFiltersProvider({ children }) {
    const [filters, setFilters] = useState(DEFAULT_DETECTION_FILTERS);

    return (
        <DetectionFiltersContext.Provider value={{ filters, setFilters }}>
            {children}
        </DetectionFiltersContext.Provider>
    );
}
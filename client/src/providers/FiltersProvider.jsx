import React, { useState } from 'react';
import FiltersContext from '../contexts/FiltersContext';

// FiltersProvider component to manage filter state. Wraps DetectionsContent with filter context.
const FiltersProvider = ({ children }) => {
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
        <FiltersContext.Provider value={{ filters, setFilters }}>
            {children}
        </FiltersContext.Provider>
    );
};

export default FiltersProvider;
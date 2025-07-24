import React, { useState } from 'react';
import SelectedStationContext from '../contexts/SelectedStationContext';

export const SelectedStationProvider = ({ children }) => {
    const [selectedStation, setSelectedStation] = useState(null);

    return (
        <SelectedStationContext.Provider value={{ selectedStation, setSelectedStation }}>
            {children}
        </SelectedStationContext.Provider>
    );
}

export default SelectedStationProvider;
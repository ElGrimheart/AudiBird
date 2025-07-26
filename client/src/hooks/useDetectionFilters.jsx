import { useContext } from 'react';
import DetectionFiltersContext from '../contexts/DetectionFiltersContext';

// Custom hook to access detection filters context
export const useDetectionFilters = () => {
    const context = useContext(DetectionFiltersContext);
    if (!context) {
        throw new Error('useDetectionFilters must be used within a DetectionFiltersProvider');
    }
    return context;
};
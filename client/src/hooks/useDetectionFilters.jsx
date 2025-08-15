import { useContext } from 'react';
import DetectionFiltersContext from '../contexts/DetectionFiltersContext';

// Custom hook to access detection filters context. Used to manage and retrieve detection filters from DetectionSidebar
export default function useDetectionFilters() {
    const context = useContext(DetectionFiltersContext);
    if (!context) {
        throw new Error('useDetectionFilters must be used within a DetectionFiltersProvider');
    }
    return context;
}
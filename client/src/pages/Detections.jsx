import DetectionsContainer from "../components/detections/DetectionsContainer";
import DetectionFiltersProvider from "../providers/DetectionFiltersProvider";

/* Main entry point for the Detections page. 
Wraps the DetectionsContainer with DetectionFiltersProvider to manage filter state
*/
const Detections = () => {
    return (
        <DetectionFiltersProvider>
            <DetectionsContainer />
        </DetectionFiltersProvider>
    );
}

export default Detections;
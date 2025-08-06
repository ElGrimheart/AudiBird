import DetectionsContainer from "../components/detections/DetectionsContainer";
import DetectionFiltersProvider from "../providers/DetectionFiltersProvider";

/* Main entry point for the Detections page. 
Wraps the DetectionsContainer with DetectionFiltersProvider to manage filter state
*/
export default function Detections() {
    return (
        <DetectionFiltersProvider>
            <DetectionsContainer />
        </DetectionFiltersProvider>
    );
}
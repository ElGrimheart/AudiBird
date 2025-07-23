import DetectionsContent from "../components/detections/DetectionsContainer";
import FiltersProvider from "../providers/FiltersProvider";

// Main entry point for the Detections page, rendering the DetectionsContent component.
const Detections = () => {
    return (
        <FiltersProvider>
            <DetectionsContent />
        </FiltersProvider>
    );
}

export default Detections;
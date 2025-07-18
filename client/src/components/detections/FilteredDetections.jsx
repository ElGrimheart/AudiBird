import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { formatStringToDate } from '../../utils/dateFormatter';

// FilteredDetections component to display detections in an accordion format
const FilteredDetections = ({ detections }) => (
    <Accordion>
        {detections.map(detection => (
            <Accordion.Item eventKey={detection.detection_id} key={detection.detection_id}>
                <Accordion.Header>
                    {detection.common_name}, {detection.scientific_name}, {formatStringToDate(detection.detection_timestamp)}, {Math.round(detection.confidence * 100)}%
                    {detection.audio_id ? (
                        <audio controls src={`http://192.168.0.37:3002/api/audio/${detection.audio_id}`} />
                    ) : (
                        " No audio available"
                    )}
                </Accordion.Header>
                <Accordion.Body>
                    <div>
                        <p>Confidence: {Math.round(detection.confidence * 100)}%</p>
                        {Object.entries(detection.audio_metadata).map(([key, value]) => (
                            <p key={key}>{key}: {value}</p>
                        ))}
                        {Object.entries(detection.processing_metadata).map(([key, value]) => (
                            <p key={key}>{key}: {value}</p>
                        ))}
                        {detection.station_metadata && Object.entries(detection.station_metadata).map(([key, value]) => (
                            <p key={key}>{key}: {value}</p>
                        ))}
                    </div>
                </Accordion.Body>
            </Accordion.Item>
        ))}
    </Accordion>
);

export default FilteredDetections;
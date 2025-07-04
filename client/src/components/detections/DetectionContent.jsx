import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';

const DetectionsContent = () => {

    const [detections, setDetections] = useState([]);

    const getDetections = async (stationId) => {
    try {
        const response = await axios.get(`http://localhost:3002/api/stations/${stationId}/detections/all`);
        setDetections(response.data.result || []);
    } catch (error) {
        console.error('Failed to fetch detections:', error);
        setDetections([]);
    }
    }

    useEffect(() => {
        const stationId = '149cd7cd-350e-4a84-a3dd-f6d6b6afaf5f'; // Example station ID
        getDetections(stationId);
    }, []);

    return (
        <Accordion>
        {detections.map(detection => (
            <Accordion.Item eventKey={detection.id} key={detection.id}>
            <Accordion.Header>{detection.common_name}, {detection.detection_time}</Accordion.Header>
            <Accordion.Body>
                {/* Detection details, audio, metadata, etc. */}
            </Accordion.Body>
            </Accordion.Item>
        ))}
        </Accordion>
    )
}

export default DetectionsContent;
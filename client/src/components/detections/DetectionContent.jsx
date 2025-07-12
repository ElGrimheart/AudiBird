import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import { formatStringToDate } from '../../utils/dateFormatter';
import Sidebar from '../common/Sidebar';

const DetectionsContent = () => {

    const stationId = '149cd7cd-350e-4a84-a3dd-f6d6b6afaf5f';

    const [detections, setDetections] = useState([]);
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        species: '',
        min_confidence: '',
        max_confidence: '',
        sort_by: 'detection_timestamp',
        sort: 'desc'
    });

    const getDetections = async (stationId, filters = {}) => {
        try {
            const params = {
                from: filters.from || undefined,
                to: filters.to || undefined,
                species: filters.species || undefined,
                sort_by: filters.sort_by,
                sort: filters.sort
            };
            // Only add confidence filters if they are valid numbers
            if (
                filters.min_confidence !== '' &&
                !isNaN(Number(filters.min_confidence)) &&
                filters.min_confidence !== null
            ) {
                params.min_confidence = Number(filters.min_confidence);
            }
            if (
                filters.max_confidence !== '' &&
                !isNaN(Number(filters.max_confidence)) &&
                filters.max_confidence !== null
            ) {
                params.max_confidence = Number(filters.max_confidence);
            }

            const response = await axios.get(
                `http://localhost:3002/api/stations/${stationId}/detections/`,
                { params }
            );
            setDetections(response.data.result || []);
        } catch (error) {
            console.error('Failed to fetch detections:', error);
            setDetections([]);
        }
    };

    useEffect(() => {
        getDetections(stationId, {}); // fetch all on mount
    }, []);

    const [showSidebar, setShowSidebar] = useState(false);
    const handleCloseSidebar = () => setShowSidebar(false);
    const handleShowSidebar = () => setShowSidebar(true);
    const handleToggleSidebar = () => setShowSidebar(!showSidebar);

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle filter submit
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        getDetections(stationId, filters);
        handleCloseSidebar();
    };

    return (
        <Container fluid className="p-4">
            <Button variant="primary" className="mb-3" onClick={handleShowSidebar}>
                Show Filters
            </Button>
            <Sidebar title="Filters" show={showSidebar} onHide={handleCloseSidebar}>
                <Form onSubmit={handleFilterSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Date Range</Form.Label>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="date"
                                    name="from"
                                    value={filters.from}
                                    onChange={handleFilterChange}
                                    placeholder="From"
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="date"
                                    name="to"
                                    value={filters.to}
                                    onChange={handleFilterChange}
                                    placeholder="To"
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Species</Form.Label>
                        <Form.Control
                            type="text"
                            name="species"
                            value={filters.species}
                            onChange={handleFilterChange}
                            placeholder="Species name"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Confidence (%)</Form.Label>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="number"
                                    name="min_confidence"
                                    value={filters.min_confidence}
                                    onChange={handleFilterChange}
                                    placeholder="Min"
                                    min={0}
                                    max={100}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="number"
                                    name="max_confidence"
                                    value={filters.max_confidence}
                                    onChange={handleFilterChange}
                                    placeholder="Max"
                                    min={0}
                                    max={100}
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Sort By</Form.Label>
                        <Form.Select
                            name="sort_by"
                            value={filters.sort_by}
                            onChange={handleFilterChange}
                        >
                            <option value="detection_timestamp">Detection Time</option>
                            <option value="confidence">Confidence</option>
                            <option value="common_name">Species Name</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Sort Order</Form.Label>
                        <Form.Select
                            name="sort"
                            value={filters.sort}
                            onChange={handleFilterChange}
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </Form.Select>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">
                        Apply Filters
                    </Button>
                </Form>
            </Sidebar>
            <Accordion>
                {detections.map(detection => (
                    <Accordion.Item eventKey={detection.detection_id} key={detection.detection_id}>
                        <Accordion.Header>
                            {detection.common_name}, {detection.scientific_name}, {formatStringToDate(detection.detection_timestamp)}
                        </Accordion.Header>
                        <Accordion.Body>
                            {/* Detection details, audio, metadata, etc. */}
                            <div>
                                <p>Confidence: {Math.round(detection.confidence * 100)}%</p>
                                {Object.entries(detection.audio_metadata).map(([key, value]) => (
                                    <p key={key}>
                                        {key}: {value}
                                    </p>
                                ))}
                                {Object.entries(detection.processing_metadata).map(([key, value]) => (
                                    <p key={key}>
                                        {key}: {value}
                                    </p>
                                ))}
                                {detection.station_metadata && Object.entries(detection.station_metadata).map(([key, value]) => (
                                    <p key={key}>
                                        {key}: {value}
                                    </p>
                                ))}
                                
                            </div>
                            {/* Add more details as needed */}
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Container>
    );
};

export default DetectionsContent;
//import React from 'react';
import React, { useState, useEffect} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import StationCard from './StationCard';
import AudioPlayerCard from './AudioPlayerCard';
import RecentDetectionsCard from './RecentDetectionsCard';
import TopSpeciesCard from './TopSpeciesCard';
import ActivityCard from './ActivityCard';
import SummaryCard from './SummaryCard';

const DashboardContent = () => {

    const [recentDetections, setRecentDetections] = useState([]);

    const getRecentDetections = async (stationId) => {
        try {
            const response = await axios.get(`http://localhost:3002/api/stations/${stationId}/detections/recent`);
            setRecentDetections(response.data.result || []);
        } catch (error) {
            console.error('Failed to fetch detections:', error);
            setRecentDetections([]);
        }
    }

    useEffect(() => {
        const stationId = '149cd7cd-350e-4a84-a3dd-f6d6b6afaf5f'; // Example station ID
        getRecentDetections(stationId);
    }, []);


    return (
        <Container fluid className="p-4">
            {/* Row 1: Station Status + Audio Player */}
            <Row className="mb-4">
                <Col md={6}>
                    <StationCard station={{ name: "Station 1", description: "Main field station", isActive: true }} />
                </Col>
                <Col md={6}>
                    <AudioPlayerCard audioFile={{ name: "Sample Audio", duration: "3:45" }} />
                </Col>
            </Row>

            {/* Row 2: Recent Detections + Top Species */}
            <Row className="mb-4">
                <Col md={6}>
                    <RecentDetectionsCard detectionList={recentDetections}/>
                </Col>
                <Col md={6}>
                    <TopSpeciesCard speciesList={[
                        { name: "Bird A", count: 120 },
                        { name: "Bird B", count: 100 },
                        { name: "Bird C", count: 80 },
                        { name: "Bird D", count: 60 },
                        { name: "Bird E", count: 40 }
                    ]} />
                </Col>
            </Row>

            {/* Row 3: Summary Stats Cards */}
            <Row className="mb-4">
                <Col md={3}><p>Total detections</p></Col>
                <Col md={3}><p>Species detections</p></Col>
                <Col md={3}><p>Todays detection count</p></Col>
                <Col md={3}><p>Todays species count</p></Col>
                <Col md={3}><p>Hour detection count</p></Col>
                <Col md={3}><p>Hour species count</p></Col>
            </Row>

            {/* Row 4: Activity Chart */}
            <Row>
                <Col>
                    <ActivityCard chartData={{
                        labels: ['Detections'],
                        datasets: [
                            {
                                label: 'Detections',
                                data: [
                                    { x: '2025-07-04T00:00:00Z', y: 5 },
                                    { x: '2025-07-04T01:00:00Z', y: 10 },
                                    { x: '2025-07-04T02:00:00Z', y: 15 },
                                    { x: '2025-07-04T03:00:00Z', y: 2 },
                                    { x: '2025-07-04T04:00:00Z', y: 65 },
                                    { x: '2025-07-04T05:00:00Z', y: 30 },
                                    { x: '2025-07-04T06:00:00Z', y: 16 },
                                    { x: '2025-07-04T07:00:00Z', y: 8 },
                                    { x: '2025-07-04T08:00:00Z', y: 12 },
                                    { x: '2025-07-04T09:00:00Z', y: 20 },
                                    { x: '2025-07-04T10:00:00Z', y: 25 },
                                    { x: '2025-07-04T11:00:00Z', y: 18 },
                                    { x: '2025-07-04T12:00:00Z', y: 22 },
                                    { x: '2025-07-04T13:00:00Z', y: 30 },
                                    { x: '2025-07-04T14:00:00Z', y: 40 },
                                    { x: '2025-07-04T15:00:00Z', y: 50 },
                                    { x: '2025-07-04T16:00:00Z', y: 60 },
                                    { x: '2025-07-04T17:00:00Z', y: 70 },
                                    { x: '2025-07-04T18:00:00Z', y: 80 },
                                    { x: '2025-07-04T19:00:00Z', y: 90 },
                                    { x: '2025-07-04T20:00:00Z', y: 100 },
                                    { x: '2025-07-04T21:00:00Z', y: 110 },
                                    { x: '2025-07-04T22:00:00Z', y: 120 },
                                    { x: '2025-07-04T23:00:00Z', y: 130 }
                                ]
                            }
                        ]
                    }
                } />
                </Col>
            </Row>

            </Container>
    )
}

export default DashboardContent;
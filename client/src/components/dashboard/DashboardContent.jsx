//import React from 'react';
import React, { useState, useEffect, useContext} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SocketContext from '../../contexts/SocketContext';
import axios from 'axios';
import StationCard from './StationCard';
import MicStreamCard from './MicStreamCard';
import RecentDetectionsCard from './RecentDetectionsCard';
import TopSpeciesCard from './TopSpeciesCard';
import ActivityCard from './ActivityCard';
import SummaryCard from './SummaryCard';

const stationId = '149cd7cd-350e-4a84-a3dd-f6d6b6afaf5f'; // Example station ID
const API_URL = import.meta.env.VITE_API_URL

const DashboardContent = () => {
    const socketRef = useContext(SocketContext);
    const socket = socketRef.current;
    
    const [recentDetections, setRecentDetections] = useState([]);
    const [commonSpecies, setCommonSpecies] = useState([]);
    const [summaryStats, setSummaryStats] = useState([]);
    const [isStreamPlaying, setIsStreamPlaying] = useState(false);

    useEffect(() => {
        const getRecentDetections = async () => {
            try {
                const response = await axios.get(`${API_URL}/stations/${stationId}/detections/recent`);
                setRecentDetections(response.data.result || []);
            } catch (error) {
                console.error('Failed to fetch detections:', error);
                setRecentDetections([]);
            }
        };

        const getCommonSpecies = async () => {
            try {
                const response = await axios.get(`${API_URL}/stations/${stationId}/detections/common`);
                setCommonSpecies(response.data.result || []);
            } catch (error) {
                console.error('Failed to fetch common species:', error);
                setCommonSpecies([]);
            }
        };

        const getSummaryStats = async () => {
            try {
                const response = await axios.get(`${API_URL}/stations/${stationId}/detections/summary`);
                const statsArr = Object.entries(response.data.result || {}).map(([key, value]) => ({
                    label: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                    value
                }));
            setSummaryStats(statsArr || []);
            } catch (error) {
                console.error('Failed to fetch summary stats:', error);
                setSummaryStats([]);
            }
        };

        getRecentDetections();
        getCommonSpecies();
        getSummaryStats();

        if (!socket) return;

        // Listen for new detection events
        const handleNewDetection = () => {
            getRecentDetections();
            getCommonSpecies();
            getSummaryStats();
        };

        socket.on("newDetection", handleNewDetection);

        // Cleanup on unmount
        return () => {
            socket.off("newDetection", handleNewDetection);
        };
    }, [socket]);


    // Stream handlers
    const handleStreamPlay = () => setIsStreamPlaying(true);
    const handleStreamPause = () => setIsStreamPlaying(false);


    return (
        <Container fluid className="p-4">
            {/* Row 1: Station Status + Audio Player */}
            <Row className="mb-4">
                <Col md={6}>
                    <StationCard station={{ name: "Station 1", description: "Main field station", isActive: true }} />
                </Col>
                <Col md={6}>
                    <MicStreamCard
                        isPlaying={isStreamPlaying}
                        onPlay={handleStreamPlay}
                        onPause={handleStreamPause}
                    />
                </Col>
            </Row>

            {/* Row 2: Recent Detections + Top Species */}
            <Row className="mb-4">
                <Col md={6}>
                    <RecentDetectionsCard detectionList={recentDetections}/>
                </Col>
                <Col md={6}>
                    <TopSpeciesCard speciesList={commonSpecies} />
                </Col>
            </Row>

            {/* Row 3: Summary Stats Cards */}
            <Row>
                <Col>
                    <SummaryCard stats={summaryStats} />
                </Col>
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
                                    { x: '2025-07-04T13:00:00Z', y: 4 },
                                    { x: '2025-07-04T14:00:00Z', y: 15 },
                                    { x: '2025-07-04T15:00:00Z', y: 63 },
                                    { x: '2025-07-04T16:00:00Z', y: 43 },
                                    { x: '2025-07-04T17:00:00Z', y: 24 },
                                    { x: '2025-07-04T18:00:00Z', y: 34 },
                                    { x: '2025-07-04T19:00:00Z', y: 13 },
                                    { x: '2025-07-04T20:00:00Z', y: 5 },
                                    { x: '2025-07-04T21:00:00Z', y: 5 },
                                    { x: '2025-07-04T22:00:00Z', y: 2 },
                                    { x: '2025-07-04T23:00:00Z', y: 5 }
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
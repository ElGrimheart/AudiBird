import React, { useContext } from "react";
import { Row, Col, Badge, Button } from "react-bootstrap";
import ProgressBar from "react-bootstrap/ProgressBar";
import Spinner from "react-bootstrap/Spinner";
import SelectedStationContext from "../../contexts/SelectedStationContext.jsx";
import useStartStopStation from "../../hooks/useStartStopStation.jsx";
import ComponentCard from "../common/ComponentCard";
import SkeletonComponent from "../common/SkeletonPlaceholder";

// StationCard component to display the status of a specific station.
// Includes functionality for starting/stopping the recording and field variants to highlight any abnormal states
export default function StationCard({ stationStatus, loading, error }) {
    const { selectedStation } = useContext(SelectedStationContext);
    const { startStopRecording, loading: recordingLoading } = useStartStopStation();

    const handleStartStop = async (isRecording) => {
        await startStopRecording(selectedStation, isRecording);
    };

    return (
        <ComponentCard title="Station Status">
            {/* Error handling and loading state */}
            {error && <div className="text-danger">Error: {error.message}</div>}
            {loading ? <SkeletonComponent height={200} /> : (
                stationStatus ? (

                    /* Station information */
                    (stationStatus.status==="online") ? (
                        <div>
                            <Row className="mb-3 justify-content-between align-items-center">
                                <Col className="d-flex justify-content-center">
                                    <h3><Badge bg="success">Online</Badge></h3>
                                </Col>
                                <Col className="d-flex justify-content-center">
                                    {(stationStatus.is_recording===true) ? (
                                        <Button 
                                            variant="primary" 
                                            onClick={() => handleStartStop(true)}
                                            disabled={recordingLoading}
                                        >
                                            {recordingLoading ? (
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                            ) : (
                                                <i className="bi bi-record-circle-fill me-2"></i>
                                            )}
                                            Stop Recording
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="danger"
                                            onClick={() => handleStartStop(false)}
                                            disabled={recordingLoading}
                                        >
                                            {recordingLoading ? (
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                            ) : (
                                                <i className="bi bi-record-circle-fill me-2"></i>
                                            )}
                                            Start Recording
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                            
                            <p>CPU Temperature: {stationStatus.cpu_temp}°C</p>

                            <div className="mb-2">
                                {(typeof stationStatus.battery_level_percent === "number") ?
                                    <span>Battery Level:
                                        <ProgressBar 
                                            now={stationStatus.battery_level_percent} 
                                            label={`${stationStatus.battery_level_percent}%`} 
                                            variant={stationStatus.battery_level_percent < 20 ? "danger" : "success"}
                                        />
                                    </span>
                                : <p>Power Source: Mains</p>
                                }
                            </div>

                            <div className="mb-2">
                                <span>Memory Usage:</span>
                                <ProgressBar 
                                    now={stationStatus.memory_usage_percent} 
                                    label={`${stationStatus.memory_usage_percent}%`} 
                                    variant={stationStatus.memory_usage_percent > 80 ? "danger" : "success"}
                                />
                            </div>

                            <div className="mb-2">
                                <span>Disk Usage:</span>
                                <ProgressBar 
                                    now={stationStatus.disk_usage_percent} 
                                    label={`${stationStatus.disk_usage_percent}%`} 
                                    variant={stationStatus.disk_usage_percent > 80 ? "danger" : "info"}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <h1><Badge bg="danger">Offline</Badge></h1>
                            <p>Last seen: {new Date(stationStatus.created_at).toLocaleString()}</p>
                        </div>
                    )
                ) : (
                    <div className="text-center text-muted">
                        Unable to retrieve station status.
                    </div>
                )
            )}
        </ComponentCard>
    );
}
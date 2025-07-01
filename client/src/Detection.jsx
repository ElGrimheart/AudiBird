import axios from 'axios';
import { useEffect, useState } from 'react';

function Detection() {

  const [detections, setDetections] = useState([]);

  const getDetections = async (stationId) => {
  try {
    const response = await axios.get(`http://localhost:3002/api/stations/${stationId}/detections`);
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
    <div>

      <h1>Detection Component</h1>
      { detections.length > 0 ? (
        <ul>
          {detections.map((detection, index) => (
            <li key={index}>
              <p>Station ID: {detection.station_id}</p>
              <p>Detection Time: {new Date(detection.detection_time).toLocaleString()}</p>
              <p>Species: {detection.common_name}</p>
              <p>Confidence: {detection.confidence}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No detections found for this station.</p>
      )}
    </div>
  );
}

export default Detection;
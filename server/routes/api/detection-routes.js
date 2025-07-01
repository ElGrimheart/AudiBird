import express from 'express';
import * as detectionController from '../../controllers/detection-controller.js';

const detectionrouter = express.Router();

// GET /api/:stationId/detections route - retrieves all detections for a given station
detectionrouter.get('/:stationId/detections', detectionController.getDetectionsByStationId);


export default detectionrouter;
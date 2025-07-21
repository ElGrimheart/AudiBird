import express from 'express';
import * as detectionController from '../../controllers/detection-controller.js';
import * as stationController from '../../controllers/station-controller.js';
import verifyStationId from '../../middleware/verifyStationId.js';
import verifyDetectionIdFormat from '../../middleware/verifyDetectionIdFormat.js';

const stationrouter = express.Router();

stationrouter.use('/:stationId', verifyStationId);

// Station Routes
// stationrouter.get('/', stationController.getAllStations);
stationrouter.get('/:stationId', stationController.getStationById);
//stationrouter.get('/:stationId/config', stationController.getStationConfigById);
// stationrouter.get('/:stationId/status', stationController.getStationStatusById);

// stationrouter.post(':stationId/status', stationController.updateStationStatusById);


// Detection Routes
stationrouter.get('/:stationId/detections/all', detectionController.getAllDetectionsByStationId);
stationrouter.get('/:stationId/detections/recent', detectionController.getRecentDetectionsByStationId);
stationrouter.get('/:stationId/detections/common', detectionController.getMostCommonSpeciesByStationId);
stationrouter.get('/:stationId/detections/summary', detectionController.getDetectionSummaryByStationId);
stationrouter.get('/:stationId/detections/', detectionController.getFilteredDetectionsByStationId);
stationrouter.get('/:stationId/detections/:detectionId', verifyDetectionIdFormat, detectionController.getDetectionById);

stationrouter.post('/:stationId/detections', detectionController.createDetection);

export default stationrouter;
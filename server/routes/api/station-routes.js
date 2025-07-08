import express from 'express';
import * as detectionController from '../../controllers/detection-controller.js';
import verifyStationId from '../../middleware/verifyStationId.js';

const stationrouter = express.Router();

stationrouter.use('/:stationId', verifyStationId);

stationrouter.get('/:stationId/detections/all', detectionController.getAllDetectionsByStationId);
stationrouter.get('/:stationId/detections/recent', detectionController.getRecentDetectionsByStationId);
stationrouter.get('/:stationId/detections/common', detectionController.getMostCommonSpeciesByStationId);
stationrouter.get('/:stationId/detections/summary', detectionController.getDetectionSummaryByStationId);

stationrouter.get('/:stationId/detections/', detectionController.getFilteredDetectionsByStationId);
stationrouter.get('/:stationId/detections/:detectionId', detectionController.getDetectionById);

export default stationrouter;
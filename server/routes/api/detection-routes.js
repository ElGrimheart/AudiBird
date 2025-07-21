import express from 'express';
import * as detectionController from '../../controllers/detection-controller.js';
import verifyStationId from '../../middleware/verifyStationId.js';
import verifyDetectionIdFormat from '../../middleware/verifyDetectionIdFormat.js';

const detectionRouter = express.Router();

detectionRouter.get('/all/:stationId', verifyStationId, detectionController.getAllDetectionsByStationId);
detectionRouter.get('/recent/:stationId', verifyStationId, detectionController.getRecentDetectionsByStationId);
detectionRouter.get('/common/:stationId', verifyStationId, detectionController.getMostCommonSpeciesByStationId);
detectionRouter.get('/summary/:stationId', verifyStationId, detectionController.getDetectionSummaryByStationId);
detectionRouter.get('/filtered/:stationId', verifyStationId, detectionController.getFilteredDetectionsByStationId);
detectionRouter.get('/:detectionId', verifyDetectionIdFormat, detectionController.getDetectionById);

detectionRouter.post('/new/:stationId', verifyStationId, detectionController.createDetection);

/* Future development - multi-stations support
/api/detections/all?stations=stationId1,stationId2 - all detections for multiple stations
/api/detections/recent?stations=stationId1,stationId2 - recent detections for multiple stations
/api/detections/common?stations=stationId1,stationId2 - most common species for multiple stations
/api/detections/summary?stations=stationId1,stationId2 - summary for multiple stations
/api/detections/filtered?stations=stationId1,stationId2&otherFilters=... - filtered detections for multiple stations
*/

export default detectionRouter;
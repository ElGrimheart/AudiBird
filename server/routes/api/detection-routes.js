import express from 'express';
import { validateStationId, validateDetectionId, authenticateJWT, authenticateApiKey, authenticateAccessPermission, authenticateWritePermission } from '../../middleware/authenticator.js';
import { validateDetectionFilters } from '../../middleware/client-request-validator.js';
import { validateNewDetection } from '../../middleware/station-validator.js';
import * as detectionController from '../../controllers/detection-controller.js';

const detectionRouter = express.Router();

detectionRouter.get('/all/:stationId', 
    validateStationId,
    authenticateJWT, 
    authenticateAccessPermission,
    detectionController.getAllDetectionsByStationId
);

detectionRouter.get('/recent/:stationId', 
    validateStationId,
    authenticateJWT, 
    authenticateAccessPermission,
    detectionController.getRecentDetectionsByStationId
);

detectionRouter.get('/filtered/:stationId', 
    validateStationId,
    authenticateJWT, 
    authenticateAccessPermission,
    validateDetectionFilters, 
    detectionController.getFilteredDetectionsByStationId
);

detectionRouter.get('/:stationId/:detectionId', 
    validateStationId,
    authenticateJWT, 
    authenticateAccessPermission,
    validateDetectionId, 
    detectionController.getDetectionById
);


detectionRouter.post('/new/:stationId', 
    validateStationId, 
    authenticateApiKey, 
    validateNewDetection,
    detectionController.createDetection
);

/* Future development - multi-stations support
/api/detections/all?stations=stationId1,stationId2 - all detections for multiple stations
/api/detections/recent?stations=stationId1,stationId2 - recent detections for multiple stations
/api/detections/common?stations=stationId1,stationId2 - most common species for multiple stations
/api/detections/summary?stations=stationId1,stationId2 - summary for multiple stations
/api/detections/filtered?stations=stationId1,stationId2&otherFilters=... - filtered detections for multiple stations
*/

export default detectionRouter;
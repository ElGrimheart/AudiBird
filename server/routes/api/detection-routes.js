import express from 'express';
import { authenticateUser, authenticateAccessPermission, authenticateWritePermission } from '../../middleware/authenticator.js';
import { validateDetectionId } from '../../middleware/detectionValidator.js';
import { validateStationId } from '../../middleware/stationValidator.js';
import { validateDetectionFilters, validateNewDetection } from '../../middleware/detectionValidator.js';
import * as detectionController from '../../controllers/detection-controller.js';



const detectionRouter = express.Router();

detectionRouter.get('/all/:stationId', 
    authenticateUser, 
    authenticateAccessPermission, 
    validateStationId, 
    detectionController.getAllDetectionsByStationId
);
detectionRouter.get('/recent/:stationId', 
    authenticateUser, 
    authenticateAccessPermission, 
    validateStationId, 
    detectionController.getRecentDetectionsByStationId
);
detectionRouter.get('/common/:stationId', 
    authenticateUser, 
    authenticateAccessPermission, 
    validateStationId, 
    detectionController.getMostCommonSpeciesByStationId
);
detectionRouter.get('/summary/:stationId', 
    authenticateUser, 
    authenticateAccessPermission, 
    validateStationId, 
    detectionController.getDetectionSummaryByStationId
);
detectionRouter.get('/filtered/:stationId', 
    authenticateUser, 
    authenticateAccessPermission, 
    validateStationId, 
    validateDetectionFilters, 
    detectionController.getFilteredDetectionsByStationId
);
detectionRouter.get('/:stationId/:detectionId', 
    authenticateUser, 
    authenticateAccessPermission, 
    validateDetectionId, 
    detectionController.getDetectionById
);

detectionRouter.post('/new/:stationId', 
    validateStationId, 
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
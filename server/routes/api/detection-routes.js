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

detectionRouter.get('/alternative-species/:stationId/:detectionId', 
    validateStationId,
    authenticateJWT, 
    authenticateAccessPermission,
    validateDetectionId, 
    detectionController.getAlternativeSpeciesByDetectionId
);



detectionRouter.post('/new/:stationId', 
    validateStationId, 
    authenticateApiKey, 
    validateNewDetection,
    detectionController.createDetection
);



detectionRouter.patch('/verify/:stationId/:detectionId', 
    validateStationId, 
    authenticateJWT, 
    authenticateWritePermission, 
    validateDetectionId, 
    detectionController.verifyDetection
);

detectionRouter.patch('/reclassify/:stationId/:detectionId', 
    validateStationId, 
    authenticateJWT, 
    authenticateWritePermission, 
    validateDetectionId, 
    detectionController.reclassifyDetection
);  



detectionRouter.delete('/delete/:stationId/:detectionId', 
    validateStationId, 
    authenticateJWT, 
    authenticateWritePermission, 
    validateDetectionId, 
    detectionController.deleteDetection
);

export default detectionRouter;
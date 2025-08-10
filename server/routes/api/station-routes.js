import express from 'express';
import { authenticateJWT, authenticateApiKey, authenticateAccessPermission, dualAuth } from '../../middleware/authenticators.js';
import { validateStationId, validateStatusUpdate } from '../../middleware/stationValidator.js';
import * as stationController from '../../controllers/station-controller.js';

const stationRouter = express.Router();

stationRouter.get('/status/:stationId', 
    authenticateJWT, 
    authenticateAccessPermission,
    validateStationId,
    stationController.getStationStatusById
);

stationRouter.get('/metadata/:stationId', 
    dualAuth,
    authenticateAccessPermission,
    validateStationId,
    stationController.getStationMetadataById
);

stationRouter.get('/:stationId',
    authenticateJWT, 
    authenticateAccessPermission,
    validateStationId,
    stationController.getStationById
);

stationRouter.post('/announce', stationController.createStation);

stationRouter.post('/register', 
    authenticateJWT,
    stationController.registerStation
);

stationRouter.post('/config/:stationId', 
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    stationController.updateStationConfigById
);

stationRouter.post('/status/:stationId',
    authenticateApiKey,
    validateStationId,
    validateStatusUpdate,
    stationController.createStationStatus
);

stationRouter.post('/start/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    stationController.startStationRecording
)

stationRouter.post('/stop/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    stationController.stopStationRecording
);

stationRouter.post('/config/:stationId', 
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    stationController.updateStationConfigById
);

export default stationRouter;
import express from 'express';
import { validateStationId, authenticateJWT, authenticateApiKey, authenticateAccessPermission, authenticateWritePermission, dualAuth } from '../../middleware/authenticator.js';
import { validateStatusUpdate } from '../../middleware/station-validator.js';
import { validateStationSettings, validateRegisterStation } from '../../middleware/client-request-validator.js'
import * as stationController from '../../controllers/station-controller.js';

const stationRouter = express.Router();

stationRouter.get('/config/:stationId',
    validateStationId,
    dualAuth,
    stationController.getStationConfigById
);

stationRouter.get('/status/:stationId', 
    validateStationId,
    authenticateJWT, 
    authenticateAccessPermission,
    stationController.getStationStatusById
);

stationRouter.get('/metadata/:stationId', 
    validateStationId,
    authenticateJWT,
    authenticateAccessPermission,
    stationController.getStationMetadataById
);


stationRouter.post('/announce', stationController.createStation);

stationRouter.post('/register', 
    authenticateJWT,
    validateRegisterStation,
    stationController.registerStation
);

stationRouter.post('/status/:stationId',
    validateStationId,
    authenticateApiKey,
    validateStatusUpdate,
    stationController.createStationStatus
);

stationRouter.post('/start/:stationId',
    validateStationId,
    authenticateJWT,
    authenticateWritePermission,
    stationController.startStationRecording
);

stationRouter.post('/stop/:stationId',
    validateStationId,
    authenticateJWT,
    authenticateWritePermission,
    stationController.stopStationRecording
);


stationRouter.patch('/config/:stationId', 
    validateStationId,
    authenticateJWT,
    authenticateWritePermission,
    validateStationSettings,
    stationController.updateStationConfigByStationId
);

export default stationRouter;
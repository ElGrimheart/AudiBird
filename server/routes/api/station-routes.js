import express from 'express';
import { authenticateJWT, authenticateAccessPermission, dualAuth } from '../../middleware/authenticators.js';
import { validateStationId } from '../../middleware/stationValidator.js';
import * as stationController from '../../controllers/station-controller.js';

const stationRouter = express.Router();

// Station Routes
// stationRouter.get('/status/:stationId', stationController.getStationStatusById);
stationRouter.get('/metadata/:stationId', 
    dualAuth,
    authenticateAccessPermission,
    validateStationId,
    stationController.getStationMetadataById);

stationRouter.get('/:stationId',
    authenticateJWT, 
    authenticateAccessPermission,
    validateStationId,
    stationController.getStationById);

// stationRouter.post('/status/:stationId', stationController.updateStationStatusById);
// stationRouter.post('/config/:stationId', stationController.updateStationConfigById);
// stationRouter.post('/:stationId', stationController.createStation);

export default stationRouter;
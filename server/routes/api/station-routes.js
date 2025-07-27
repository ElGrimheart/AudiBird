import express from 'express';
import { authenticateJWT, authenticateAccessPermission } from '../../middleware/authenticators.js';
import { validateStationId } from '../../middleware/stationValidator.js';
import * as stationController from '../../controllers/station-controller.js';

const stationRouter = express.Router();

// Station Routes
// stationRouter.get('/status/:stationId', stationController.getStationStatusById);
// stationRouter.get('/config/:stationId', stationController.getStationConfigById);
stationRouter.get(
    '/:stationId', 
    validateStationId, 
    authenticateJWT, 
    authenticateAccessPermission,
    stationController.getStationById);

// stationRouter.post('/status/:stationId', stationController.updateStationStatusById);
// stationRouter.post('/config/:stationId', stationController.updateStationConfigById);
// stationRouter.post('/:stationId', stationController.createStation);

export default stationRouter;
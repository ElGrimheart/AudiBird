import express from 'express';
import * as stationController from '../../controllers/station-controller.js';
import verifyStationId from '../../middleware/verifyStationId.js';

const stationRouter = express.Router();

stationRouter.use('/:stationId', verifyStationId);

// Station Routes
// stationRouter.get('/status/:stationId', stationController.getStationStatusById);
// stationRouter.get('/config/:stationId', stationController.getStationConfigById);
stationRouter.get('/:stationId', stationController.getStationById);

// stationRouter.post('/status/:stationId', stationController.updateStationStatusById);
// stationRouter.post('/config/:stationId', stationController.updateStationConfigById);
// stationRouter.post('/:stationId', stationController.createStation);

export default stationRouter;
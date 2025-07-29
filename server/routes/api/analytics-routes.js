import express from 'express';
import { authenticateJWT, authenticateAccessPermission } from '../../middleware/authenticators.js';
import { validateStationId } from '../../middleware/stationValidator.js';
import * as analyticsController from '../../controllers/analytics-controller.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/average-detections/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    analyticsController.getAverageDetectionWithinDates
);


export default analyticsRouter;   
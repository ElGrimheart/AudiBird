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

analyticsRouter.get('/species-hourly-trends/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    analyticsController.getSpeciesHourlyTrends
);

analyticsRouter.get('/species-daily-totals/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    analyticsController.getSpeciesDailyTotals
);

analyticsRouter.get('/deltas/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    analyticsController.getDeltas
);

analyticsRouter.get('/top-confidence/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    analyticsController.getTopConfidence
);

export default analyticsRouter;   
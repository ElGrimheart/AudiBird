import express from 'express';
import { authenticateJWT, authenticateAccessPermission } from '../../middleware/authenticators.js';
import { validateStationId } from '../../middleware/stationValidator.js';
import { validateAnalyticsFilters } from '../../middleware/userFormValidator.js';
import * as analyticsController from '../../controllers/analytics-controller.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/species-summary/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    analyticsController.getSpeciesSummaryByStationId
);

analyticsRouter.get('/average-hourly-trends/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    validateAnalyticsFilters,
    analyticsController.getAverageHourlyTrendsByStationId
);

analyticsRouter.get('/hourly-detection-totals/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    validateAnalyticsFilters,
    analyticsController.getHourlyDetectionTotalsByStationId
);

analyticsRouter.get('/daily-detection-totals/:stationId',
    authenticateJWT,
    authenticateAccessPermission,
    validateStationId,
    validateAnalyticsFilters,
    analyticsController.getDailyDetectionTotalsByStationId
);

export default analyticsRouter;   
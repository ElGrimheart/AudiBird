import express from 'express';
import { validateStationId, authenticateJWT, authenticateAccessPermission } from '../../middleware/authenticator.js';
import { validateAnalyticsFilters } from '../../middleware/client-request-validator.js';
import * as analyticsController from '../../controllers/analytics-controller.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/detection-summary/:stationId',
    validateStationId,
    authenticateJWT,
    authenticateAccessPermission,
    analyticsController.getDetectionSummaryByStationId
);

analyticsRouter.get('/common-species/:stationId',
    validateStationId,
    authenticateJWT,
    authenticateAccessPermission,
    analyticsController.getMostCommonSpeciesByStationId
);

analyticsRouter.get('/species-summary/:stationId',
    validateStationId,
    authenticateJWT,
    authenticateAccessPermission,
    validateAnalyticsFilters,
    analyticsController.getSpeciesSummaryByStationId
);

analyticsRouter.get('/average-hourly-trends/:stationId',
    validateStationId,
    authenticateJWT,
    authenticateAccessPermission,
    validateAnalyticsFilters,
    analyticsController.getAverageHourlyTrendsByStationId
);

analyticsRouter.get('/hourly-detection-totals/:stationId',
    validateStationId,
    authenticateJWT,
    authenticateAccessPermission,
    validateAnalyticsFilters,
    analyticsController.getHourlyDetectionTotalsByStationId
);

analyticsRouter.get('/daily-detection-totals/:stationId',
    validateStationId,
    authenticateJWT,
    authenticateAccessPermission,
    validateAnalyticsFilters,
    analyticsController.getDailyDetectionTotalsByStationId
);

export default analyticsRouter;   
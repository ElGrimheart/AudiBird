import express from 'express';
import { validateStationId, authenticateApiKey, authenticateJWT, authenticateWritePermission } from '../../middleware/authenticator.js';
import * as audioController from '../../controllers/audio-controller.js';

const audioRouter = express.Router();

audioRouter.get('/:audioId', audioController.getAudioById);

audioRouter.get('/protected/:stationId',
    validateStationId,
    authenticateApiKey,
    audioController.getProtectedAudioByStationId
);

audioRouter.patch('/protect/:stationId/:audioId',
    validateStationId,
    authenticateJWT,
    authenticateWritePermission,
    audioController.protectAudioById
);

export default audioRouter;
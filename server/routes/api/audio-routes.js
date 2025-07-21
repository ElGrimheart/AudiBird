import express from 'express';
import * as audioController from '../../controllers/audio-controller.js';

const audioRouter = express.Router();

// Example: GET /api/audio/:audioId
audioRouter.get('/:audioId', audioController.getAudioById);

export default audioRouter;
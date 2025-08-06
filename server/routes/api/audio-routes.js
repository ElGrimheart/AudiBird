import express from 'express';
import * as audioController from '../../controllers/audio-controller.js';

const audioRouter = express.Router();

audioRouter.get('/:audioId', audioController.getAudioById);

export default audioRouter;
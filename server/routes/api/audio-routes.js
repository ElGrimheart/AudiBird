import express from 'express';
import * as audioController from '../../controllers/audio-controller.js';

const audiorouter = express.Router();

// Example: GET /api/audio/:audioId
audiorouter.get('/:audioId', audioController.getAudioById);

export default audiorouter;
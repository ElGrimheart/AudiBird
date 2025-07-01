import express from 'express';
import * as usercontroller from '../../controllers/user-controller.js';

const userrouter = express.Router();

userrouter.get('/:username', usercontroller.getUserByUsername);

export default userrouter;

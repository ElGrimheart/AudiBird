import express from 'express';
import { authenticateJWT } from '../../middleware/authenticators.js';
import { validateLoginForm, validateRegisterForm } from '../../middleware/userFormValidator.js';
import * as usercontroller from '../../controllers/user-controller.js';

const userRouter = express.Router();

userRouter.get('/stations', authenticateJWT, usercontroller.getUserStations);

userRouter.post('/login', validateLoginForm, usercontroller.loginUser);
userRouter.post('/register', validateRegisterForm, usercontroller.registerUser);
userRouter.post('/logout', usercontroller.logoutUser);

export default userRouter;

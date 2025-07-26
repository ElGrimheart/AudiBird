import express from 'express';
import { authenticateUser } from '../../middleware/authenticator.js';
import { validateLoginForm, validateRegisterForm } from '../../middleware/userFormValidator.js';
import * as usercontroller from '../../controllers/user-controller.js';

const userRouter = express.Router();

userRouter.get('/stations', authenticateUser, usercontroller.getUserStations);

userRouter.post('/login', validateLoginForm, usercontroller.loginUser);
userRouter.post('/register', validateRegisterForm, usercontroller.registerUser);
userRouter.post('/logout', usercontroller.logoutUser);

export default userRouter;

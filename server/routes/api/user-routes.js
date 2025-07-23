import express from 'express';
import { validateLoginForm, validateRegisterForm } from '../../middleware/userValidator.js';
import * as usercontroller from '../../controllers/user-controller.js';

const userRouter = express.Router();

userRouter.post('/login', validateLoginForm, usercontroller.loginUser);
userRouter.post('/register', validateRegisterForm, usercontroller.registerUser);
userRouter.post('/logout', usercontroller.logoutUser);

export default userRouter;

import express from 'express';
import * as usercontroller from '../../controllers/user-controller.js';

const userRouter = express.Router();

userRouter.post('/login', usercontroller.loginUser);
userRouter.post('/register', usercontroller.registerUser); 
userRouter.post('/logout', usercontroller.logoutUser);


export default userRouter;

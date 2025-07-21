import express from 'express';
import * as usercontroller from '../../controllers/user-controller.js';

const userrouter = express.Router();

userrouter.post('/login', usercontroller.loginUser);
userrouter.post('/register', usercontroller.registerUser); 
userrouter.post('/logout', usercontroller.logoutUser);


export default userrouter;

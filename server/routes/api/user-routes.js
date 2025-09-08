import express from 'express';
import { authenticateJWT, validateStationId } from '../../middleware/authenticator.js';
import { validateLoginForm, validateUserRegistrationForm, validateUserPreferences } from '../../middleware/client-request-validator.js';
import * as usercontroller from '../../controllers/user-controller.js';

const userRouter = express.Router();

userRouter.get('/stations', 
    authenticateJWT, 
    usercontroller.getUserStations
);

userRouter.get('/preferences/:stationId', 
    authenticateJWT, 
    validateStationId, 
    usercontroller.getUserPreferencesByStationId
);

userRouter.post('/login', 
    validateLoginForm, 
    usercontroller.loginUser
);

userRouter.post('/register', 
    validateUserRegistrationForm, 
    usercontroller.registerUser
);

userRouter.post('/logout', 
    usercontroller.logoutUser
);

userRouter.patch('/preferences/:stationId', 
    authenticateJWT, 
    validateStationId, 
    validateUserPreferences, 
    usercontroller.updateUserPreferencesByStationId
);

export default userRouter;

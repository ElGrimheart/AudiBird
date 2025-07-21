import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import helmet from 'helmet';
import cors from 'cors';
import userrouter from './routes/api/user-routes.js';
import stationrouter from './routes/api/station-routes.js';
import audiorouter from './routes/api/audio-routes.js';

const app = express();

//app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(morgan('tiny'));
app.use(express.json());

app.use('/api/users', userrouter);
app.use('/api/stations', stationrouter);
app.use('/api/audio', audiorouter);


export default app;
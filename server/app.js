import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import helmet from 'helmet';
import cors from 'cors';
import userRouter from './routes/api/user-routes.js';
import stationRouter from './routes/api/station-routes.js';
import detectionRouter from './routes/api/detection-routes.js';
import audioRouter from './routes/api/audio-routes.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(morgan('tiny'));
app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/stations', stationRouter);
app.use('/api/detections', detectionRouter);
app.use('/api/audio', audioRouter);


export default app;
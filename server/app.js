import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { scheduleDailySummaryJobs } from './queues/daily-summary-queue.js';
import { scheduleDailyStationStorageCheckJobs } from './queues/low-storage-queue.js';
import userRouter from './routes/api/user-routes.js';
import stationRouter from './routes/api/station-routes.js';
import detectionRouter from './routes/api/detection-routes.js';
import analyticsRouter from './routes/api/analytics-routes.js';
import audioRouter from './routes/api/audio-routes.js';

const app = express();

// Security middleware
app.use(helmet({ 
    crossOriginResourcePolicy: { policy: "cross-origin" } 
}));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));


// Body parsing/logging middleware
app.use(morgan('tiny'));
app.use(express.json());


// Start daily job scheduling
scheduleDailySummaryJobs();
scheduleDailyStationStorageCheckJobs()


// API routes
app.use('/api/users', userRouter);
app.use('/api/stations', stationRouter);
app.use('/api/detections', detectionRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/audio', audioRouter);

export default app;
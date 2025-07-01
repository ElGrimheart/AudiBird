import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import cors from 'cors';
import userrouter from './routes/api/user-routes.js';
import stationrouter from './routes/api/station-routes.js';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(morgan('tiny'));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the AudioBirder API');
});

app.use('/api/users', userrouter);
app.use('/api/stations', stationrouter);


export default app;
import Bull from "bull";
import 'dotenv/config';

const redisOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
};

// Queue for dispatching new detection event emails
export const newDetectionQueue = new Bull("newDetectionQueue", {
    redis: redisOptions
});
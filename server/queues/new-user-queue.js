import Bull from "bull";
import 'dotenv/config';

const redisOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
};

// Queue for dispatching new user emails
export const newUserQueue = new Bull("newUserQueue", {
    redis: redisOptions
});
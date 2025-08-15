import Queue from "bull";
import 'dotenv/config';

const redisOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
};

// Queue for daily summary emails
export const dailySummaryQueue = new Queue("dailySummaryEmail", {
    redis: redisOptions
});


// Schedules daily summary jobs via Bull queues repeating job feature
export function scheduleDailySummaryJobs() {
    dailySummaryQueue.add({}, {
        repeat: {                           // Repeat every day at 8am
            cron: "0 8 * * *",
            tz: 'UTC'
        },
        removeOnComplete: true,
        removeOnFail: true
    });
}
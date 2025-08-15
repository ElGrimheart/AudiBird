import Queue from "bull";
import 'dotenv/config';

const redisOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
};

// Queue for daily station storage check emails
export const dailyStationStorageCheckQueue = new Queue("dailyStationStorageCheckEmail", {
    redis: redisOptions
});


// Schedules daily station storage check jobs via Bull queues repeating job feature
export function scheduleDailyStationStorageCheckJobs() {
    dailyStationStorageCheckQueue.add({}, {
        repeat: {                           // Repeat every day at 5pm
            cron: "0 16 * * *",
            tz: 'UTC'
        },
        removeOnComplete: true,
        removeOnFail: true
    });
}
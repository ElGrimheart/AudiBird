import { dailyStationStorageCheckQueue } from "../queues/low-storage-queue.js";
import * as stationService from "../services/station-service.js";
import * as userService from "../services/user-service.js";
import { NOTIFICATION_EVENT_TYPE_ID, NOTIFICATION_CHANNEL_TYPE_ID } from "../constants/database-type-id.js";
import { sendEmail } from "../services/email-service.js";

// Daily check on station storage usage and dispatching email notifications
dailyStationStorageCheckQueue.process(async (job) => {

    // Get station statuses
    const stationStatuses = await stationService.getLastStationStatusUpdates();
    console.log("Station statuses:", stationStatuses);

    // Get subscribed users for each active station based on preferences
    for (const station of stationStatuses) {
        const userList = await userService.getUsersByPreferences(station.station_id, NOTIFICATION_EVENT_TYPE_ID.LowStorage, NOTIFICATION_CHANNEL_TYPE_ID.Email);

        // Send storage warning to each user in station subscription list
        for (const user of userList) {

            await sendEmail({
                to: user.email,
                subject: `Audibird Low Storage Warning`,
                html: `
                    <h1>Low Storage Warning for Station: ${user.station_name}</h1>
                    <p>Your station is running low on storage space.</p>
                    <p>Current storage usage has reached <strong>${station.disk_usage_percent}</strong>%</p>
                    <p>Once storage usage reaches 90% of capacity, AudiBird will automatically delete old recordings to free up space.</p>
                    <p>Please take a moment to review your recordings and back them up if necessary.</p>
                `
            });
        }
    }
});


dailyStationStorageCheckQueue.on('failed', (job, err) => {
    console.error('Job failed:', job.id, err);
});

dailyStationStorageCheckQueue.on('completed', (job, result) => {
    console.log('Job completed:', job.id);
});
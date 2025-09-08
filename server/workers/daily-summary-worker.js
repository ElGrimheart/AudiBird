import { dailySummaryQueue } from "../queues/daily-summary-queue.js";
import * as stationService from "../services/station-service.js";
import * as userService from "../services/user-service.js";
import * as analyticsService from "../services/analytics-service.js";
import { NOTIFICATION_EVENT_TYPE_ID, NOTIFICATION_CHANNEL_TYPE_ID } from "../constants/database-type-id.js";
import { sendEmail } from "../services/email-service.js";

// Dispatches daily summary emails to subscribed users for each station
dailySummaryQueue.process(async (job) => {
    const dateToday = new Date();
    const dateYesterday = new Date();
    dateYesterday.setDate(dateToday.getDate() - 1);

    // Get active stations 
    const activeStations = await stationService.getActiveStationIds(dateYesterday, dateToday);
    console.log("Active stations:", activeStations);

    // Get user list for each active station based on preferences
    for (const station of activeStations) {
        const userList = await userService.getUsersByPreferences(station.station_id, NOTIFICATION_EVENT_TYPE_ID.DailySummary, NOTIFICATION_CHANNEL_TYPE_ID.Email);

        // Send summary email to each user in station user list
        for (const user of userList) {
            const summaryData = await analyticsService.getDailySummaryByStationId(station.station_id, dateYesterday);

            await sendEmail({
                to: user.email,
                subject: `Daily Summary for Station: ${user.station_name} - ${dateYesterday.toISOString().slice(0, 10)}`,
                html: `
                    <h1>Yesterday's Activity Summary for Station: ${user.station_name}</h1>
                    <h2><strong>Total Detections:</strong> ${summaryData.dailyDetections}</h2>
                    <h2><strong>Total Species:</strong> ${summaryData.dailySpecies}</h2>
                    <h2>Common Species:</h2>
                    <ul>
                        ${summaryData.commonSpecies.map(
                            species => `<li>${species.common_name} - ${species.count} detections</li>`
                        ).join('')}
                    </ul>
                    <h2>New Visitors:</h2>
                    <ul>
                        ${summaryData.newSpecies.length > 0
                            ? summaryData.newSpecies.map(
                                species => `<li>${species.common_name} </li>`
                            ).join('')
                            : '<li>None yesterday, hope to see some today!</li>'
                        }
                    </ul>
                `
            });
        }
    }
});


// Event listeners for job completion and failure
dailySummaryQueue.on('failed', (job, err) => {
    console.error('Job failed:', job.id, err);
});

dailySummaryQueue.on('completed', (job, result) => {
    console.log('Job completed:', job.id);
});
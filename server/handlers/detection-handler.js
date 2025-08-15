import * as userService from "../services/user-service.js";
import { newDetectionQueue } from "../queues/new-detection-queue.js";
import { NOTIFICATION_EVENT_TYPE_ID, NOTIFICATION_CHANNEL_TYPE_ID} from '../constants/database-type-id.js';
import { io } from "../server.js";

export async function handleNewDetection(detectionData) {
    console.log("Handling new detection:", detectionData);

    // Get email of subscribers tracking new detections for station
    const users = await userService.getUsersByPreferences(detectionData.station_id, NOTIFICATION_EVENT_TYPE_ID.NewDetection, NOTIFICATION_CHANNEL_TYPE_ID.Email, { confidence: detectionData.confidence });
    console.log("Users to notify:", users);

    // Add subscribers to the newDetectionQueue
    for (const user of users) {
        await newDetectionQueue.add({
            userEmail: user.email,
            newDetection: {
                ...detectionData,
                station_name: user.station_name
            }
        });
        console.log(`Job added for ${user.email}`);
    }

    // Emit socket event to station room
    io.to(detectionData.station_id).emit("newDetection", detectionData);
    
}
    
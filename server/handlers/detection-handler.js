import * as userService from "../services/user-service.js";
import { newDetectionQueue } from "../queues/new-detection-queue.js";
import { io } from "../server.js";

export async function handleNewDetection(detectionData) {
    console.log("Handling new detection:", detectionData);

    // Emit socket event to station room
    io.to(detectionData.station_id).emit("newDetection", detectionData);

    const users = await userService.getUsersByPreferences(detectionData.station_id, 1, 2, { confidence: detectionData.confidence });
    console.log("Users to notify:", users);
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
}
    
import { newDetectionQueue } from "../queues/new-detection-queue.js";
import { sendEmail } from "../services/email-service.js";

// Dispatches email notifications for new detections
newDetectionQueue.process(async (job) => {
    const { userEmail, newDetection } = job.data;
    console.log("Processing new detection for user:", userEmail);

    const subject = `Bird Detected at Station: ${newDetection.station_name}`;
    const html = `
        <h1>New Detection Alert</h1>
        <p>A new detection has been made at station: ${newDetection.station_name}</p>
        <p><strong>Species:</strong> ${newDetection.common_name}, <em>${newDetection.scientific_name}</em></p>
        <p><strong>Confidence:</strong> ${(newDetection.confidence * 100).toFixed(0)}%</p>
        <p><strong>Time:</strong> ${new Date(newDetection.detection_timestamp).toLocaleString()}</p>
    `;

    await sendEmail({
        to: userEmail,
        subject,
        html
    });
});


// Event listeners for job completion and failure
newDetectionQueue.on('failed', (job, err) => {
    console.error('Job failed:', job.id, err);
});
newDetectionQueue.on('completed', (job, result) => {
    console.log('Job completed:', job.id);
});
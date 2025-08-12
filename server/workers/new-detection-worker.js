import { newDetectionQueue } from "../queues/new-detection-queue.js";
import { sendEmail } from "../services/email-service.js";

// Processes new detection jobs and sending email notifications
newDetectionQueue.process(async (job) => {
    const { userEmail, newDetection } = job.data;
    console.log("Processing new detection for user:", userEmail);
    console.log("New detection data:", newDetection);

    const subject = `New Detection at Station ${newDetection.station_id}`;
    const html = `
        <h1>New Detection Alert</h1>
        <p>A new detection has been made at station: ${newDetection.station_id}:</p>
        <p><strong>Species:</strong> ${newDetection.common_name}, <em>${newDetection.scientific_name}</em></p>
        <p><strong>Confidence:</strong> ${(newDetection.confidence * 100).toFixed(0)}%</p>
        <p><strong>Time:</strong> ${new Date(newDetection.detection_timestamp).toLocaleString()}</p>
        <p><strong>Station:</strong> ${newDetection.station_name}</p>
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
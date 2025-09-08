import { newUserQueue } from "../queues/new-user-queue.js";
import { sendEmail } from "../services/email-service.js";
import 'dotenv/config';

//  Dispatches registration emails to new users
newUserQueue.process(async (job) => {
    const { userEmail, newUser } = job.data;
    console.log("Processing new user for email:", userEmail);

    const subject = `Welcome to Audibird!`;
    const html = `
        <h1>Welcome to Audibird!</h1>
        <p>Hi ${newUser.name},</p>
        <p>Thank you for choosing Audibird, we're excited to have you on board!</p>
        <p>Login to the <a href="${process.env.FRONTEND_URL}">Audibird webapp</a> to get started.</p>
        <p>Happy birding!</p>
    `;

    await sendEmail({
        to: userEmail,
        subject,
        html
    });
});


// Event listeners for job completion and failure
newUserQueue.on('failed', (job, err) => {
    console.error('Job failed:', job.id, err);
});

newUserQueue.on('completed', (job, result) => {
    console.log('Job completed:', job.id);
});
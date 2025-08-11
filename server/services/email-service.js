import sgMail from '@sendgrid/mail';
import 'dotenv/config';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({to, subject, html}) {
    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        html
    };
    try {
        await sgMail.send(msg);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
}
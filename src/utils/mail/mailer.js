import nodemailer from 'nodemailer';
import { generateOtpEmailTemplate } from './otpTemplate.js';



const sendEmail = async ({ email, emailType, val }) => {

    try {

        const transport = nodemailer.createTransport({
            service: process.env.Email_PROVIDER,
            port: process.env.Email_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        let templateMsg;
        let sub;
        if (emailType == 'OTP') {
            templateMsg = generateOtpEmailTemplate(val);
            sub = 'Verify Your Account';
        }


        const info = await transport.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: sub,
            html: templateMsg
        });

        return info;

    } catch (err) {
        console.error("Error sending mail : ", err);
        return;
    }


}

export default sendEmail;


import nodemailer from "nodemailer";
import generateOtpEmailTemplate from "./templates/generateOtpEmailTemplate.js";
import ResetPasswordOtpTemplate from "./templates/ResetPasswordOtpTemplate.js";
import UpdateEmailOtpTemplate from "./templates/UpdateEmailOtpTemplate.js";

const sendEmail = async ({ email, emailType, val }) => {
  try {
    const transport = nodemailer.createTransport({
      service: process.env.Email_PROVIDER,
      port: process.env.Email_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let templateMsg = "";
    let sub = "";

    if (emailType === "OTP") {
      templateMsg = generateOtpEmailTemplate(val.otp);
      sub = "Your OTP Code - Verify Your Account";
    } else if (emailType === "RESET_PASSWORD") {
      console.log(val);
      templateMsg = ResetPasswordOtpTemplate(val);
      sub = "Reset Your Password - OTP Inside";
    } else if (emailType === "UPDATE_EMAIL") {
      templateMsg = UpdateEmailOtpTemplate(val.otp); //bug
      sub = "Confirm Your Email Update - OTP Enclosed";
    }

    const info = await transport.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: sub,
      html: templateMsg,
    });
    // console.log(info);
    return info;
  } catch (err) {
    console.error("Error sending mail : ", err);
    return err;
  }
};

export default sendEmail;

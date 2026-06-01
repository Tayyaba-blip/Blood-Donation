// utils/sendOTP.js
import nodemailer from "nodemailer";

// Generate numeric OTP
export const generateOTP = (length = 6) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // 0-9
  }
  return otp;
};

// Send OTP via email (and placeholder for SMS)
export const sendOTP = async (phone, email, otp) => {
  let smsResult = { sent: false };
  let emailResult = { sent: false };

  // Send email if provided
  if (email) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // your Gmail
          pass: process.env.EMAIL_PASS, // Gmail App Password
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Blood Donation OTP",
        text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
      });

      console.log(`✅ OTP sent to email: ${email}`);
      emailResult.sent = true;
    } catch (err) {
      console.error("❌ Failed to send OTP email:", err);
    }
  }

  // Placeholder for SMS (you can integrate Twilio or other later)
  if (phone) smsResult.sent = true;

  return { sms: smsResult, email: emailResult };
};
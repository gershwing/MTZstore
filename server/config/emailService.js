import http from 'http';
import nodemailer from 'nodemailer';

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // e.g., 'smtp.gmail.com' for Gmail
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL, // your SMTP username
    pass: process.env.EMAIL_PASS,    // your SMTP password
  },
});

// Function to send email
async function sendEmail(to, subject, text, html, from) {
  try {

    const info = await transporter.sendMail({
      from: from || process.env.EMAIL_FROM || process.env.EMAIL,
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export {sendEmail};
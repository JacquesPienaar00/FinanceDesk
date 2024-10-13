// utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  // Configure your SMTP transporter for Outlook
  const transporter = nodemailer.createTransport({
    service: 'outlook', // Use 'outlook' for Outlook.com and Office 365
    auth: {
      user: process.env.OUTLOOK_EMAIL, // Update this environment variable
      pass: process.env.OUTLOOK_PASSWORD, // Update this environment variable
    },
    // You may not need the `tls` option for Outlook, but if you encounter issues, you can configure it.
    // tls: {
    //   ciphers: 'SSLv3',
    // },
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_FROM, // Sender address
    to, // List of receivers
    subject, // Subject line
    text, // Plain text body
    html, // HTML body (optional)
  };

  // Send the email
  return transporter.sendMail(mailOptions);
};

export default sendEmail;

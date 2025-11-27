import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  // service: "gmail", // Atau gunakan SMTP lain (Mailtrap, SendGrid, dll)
  // auth: {
  //   user: process.env.MAIL_USER,
  //   pass: process.env.MAIL_PASS,
  // },
  host: process.env.MAILTRAP_HOST,
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

import { transporter } from "../config/nodemailer.config";
import { emailTemplates } from "../utils/email-templates.util";
import crypto from "crypto";
import prisma from "../config/prisma.config";
import { IEmailService } from "../@types/transaction.index";

export const emailService: IEmailService = {
  async sendEmail(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: `"Evoria Events" <${process.env.MAILTRAP_HOST}>`,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  },

  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    token: string
  ) {
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const html = emailTemplates.welcomeEmail({ userName, verificationLink });

    await this.sendEmail(
      userEmail,
      "Welcome to Evoria - Verify Your Email",
      html
    );
  },

  async sendEmailVerifiedSuccess(userEmail: string, userName: string) {
    const html = `<h2>Hi ${userName},</h2><p>Your email has been verified! 🎉</p>`;
    await this.sendEmail(userEmail, "Email Verified - Evoria", html);
  },

  async sendTransactionCreated(transactionId: string) {
    console.log(`📧 Sending transaction created email for ${transactionId}`);
  },

  async sendPaymentReminder(transactionId: string) {
    console.log(`📧 Sending payment reminder for ${transactionId}`);
  },

  async sendTransactionAccepted(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true },
    });

    if (!transaction) return;

    const html = emailTemplates.transactionAccepted({
      userName: transaction.user.name,
      eventName: transaction.event.name,
      transactionId: transaction.id,
      qty: transaction.qty,
      eventDate: new Date(transaction.event.startDate).toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      }),
      venue: `${transaction.event.venue}, ${transaction.event.city}`,
    });

    await this.sendEmail(
      transaction.user.email,
      `✅ Payment Confirmed - ${transaction.event.name}`,
      html
    );
  },

  async sendTransactionRejected(transactionId: string, reason?: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true, coupon: true },
    });

    if (!transaction) return;

    const html = emailTemplates.transactionRejected({
      userName: transaction.user.name,
      eventName: transaction.event.name,
      transactionId: transaction.id,
      reason,
      pointsRestored: transaction.pointsUsed,
      couponRestored: transaction.coupon?.code,
    });

    await this.sendEmail(
      transaction.user.email,
      `❌ Transaction Rejected - ${transaction.event.name}`,
      html
    );
  },

  async sendTransactionExpired(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true, coupon: true },
    });

    if (!transaction) return;

    const html = emailTemplates.transactionExpired({
      userName: transaction.user.name,
      eventName: transaction.event.name,
      transactionId: transaction.id,
      pointsRestored: transaction.pointsUsed,
      couponRestored: transaction.coupon?.code,
    });

    await this.sendEmail(
      transaction.user.email,
      `⏰ Transaction Expired - ${transaction.event.name}`,
      html
    );
  },

  async sendTransactionCancelled(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true, coupon: true },
    });

    if (!transaction) return;

    const html = emailTemplates.transactionCancelled({
      userName: transaction.user.name,
      eventName: transaction.event.name,
      transactionId: transaction.id,
      pointsRestored: transaction.pointsUsed,
      couponRestored: transaction.coupon?.code,
    });

    await this.sendEmail(
      transaction.user.email,
      `⚠️ Transaction Cancelled - ${transaction.event.name}`,
      html
    );
  },
};

import { mailService } from "./mail.service";
import prisma from "../config/prisma.config";
import { CLIENT_URL } from "../config/index.config";
import { generateInvoiceId } from "../utils/invoice-generator";

// Helper Format Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper Format Tanggal
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const emailService = {
  /**
   * 1. Email Transaksi Dibuat (Waiting Payment)
   */
  async sendTransactionCreated(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true, ticketType: true },
    });

    if (!transaction) return;

    const invoiceId = generateInvoiceId(transaction.id, transaction.createdAt);

    await mailService.sendMail({
      to: transaction.user.email,
      subject: `Menunggu Pembayaran - ${transaction.event.name}`,
      template: "transaction-created.html",
      context: {
        transactionId: invoiceId,
        userName: transaction.user.name,
        eventName: transaction.event.name,
        ticketName: transaction.ticketType?.name,
        qty: transaction.qty,
        totalPrice: formatRupiah(transaction.finalPrice),
        expiresAt: transaction.expiresAt
          ? formatDate(transaction.expiresAt)
          : "-",
        link: `${CLIENT_URL}/member/tiket-saya`,
        year: new Date().getFullYear(),
      },
    });

    console.log(
      `✅ Email sent: Transaction Created to ${transaction.user.email}`
    );
  },

  /**
   * 2. Email Transaksi Diterima (Approved by Organizer)
   */
  async sendTransactionAccepted(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true },
    });

    if (!transaction) return;

    const invoiceId = generateInvoiceId(transaction.id, transaction.createdAt);

    await mailService.sendMail({
      to: transaction.user.email,
      subject: `Tiket Terbit! - ${transaction.event.name}`,
      template: "transaction-accepted.html",
      context: {
        userName: transaction.user.name,
        eventName: transaction.event.name,
        invoiceId,
        venue: transaction.event.venue,
        city: transaction.event.city,
        eventDate: formatDate(transaction.event.startDate),
        link: `${CLIENT_URL}/member/tiket-saya`,
        year: new Date().getFullYear(),
      },
    });
  },

  /**
   * 3. Email Transaksi Ditolak (Rejected by Organizer)
   */
  async sendTransactionRejected(transactionId: string, reason?: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true },
    });

    if (!transaction) return;

    const invoiceId = generateInvoiceId(transaction.id, transaction.createdAt);

    await mailService.sendMail({
      to: transaction.user.email,
      subject: `Transaksi Ditolak - ${transaction.event.name}`,
      template: "transaction-rejected.html",
      context: {
        userName: transaction.user.name,
        eventName: transaction.event.name,
        transactionId: invoiceId,
        reason: reason || "Bukti pembayaran tidak sesuai.",
        year: new Date().getFullYear(),
      },
    });
  },

  /**
   * 4. Email Pengingat Pembayaran (1 Jam sebelum expired)
   */
  async sendPaymentReminder(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true },
    });

    if (!transaction) return;

    await mailService.sendMail({
      to: transaction.user.email,
      subject: `⏰ Segera Selesaikan Pembayaran - ${transaction.event.name}`,
      template: "payment-reminder.html",
      context: {
        userName: transaction.user.name,
        eventName: transaction.event.name,
        link: `${CLIENT_URL}/member/tiket-saya`,
        year: new Date().getFullYear(),
      },
    });
  },

  async sendTransactionExpired(transactionId: string) {
    console.log(
      `📧 Attempting to send EXPIRED email for transaction: ${transactionId}`
    );

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true, coupon: true },
    });

    if (!transaction) {
      const error = `Transaction ${transactionId} not found when sending expired email`;
      console.error(`❌ ${error}`);
      throw new Error(error); // THROW ERROR instead of silent return
    }

    const invoiceId = generateInvoiceId(transaction.id, transaction.createdAt);

    if (!transaction.user?.email) {
      const error = `User email not found for transaction ${transactionId}`;
      console.error(`❌ [EMAIL] ${error}`);
      throw new Error(error);
    }

    const context = {
      userName: transaction.user.name,
      eventName: transaction.event.name,
      transactionId: invoiceId,
      pointsRestored: transaction.pointsUsed,
      couponRestored: transaction.coupon?.code,
      year: new Date().getFullYear(),
    };

    console.log(`📧 [EMAIL] Sending to: ${transaction.user.email}`);
    console.log(`📧 [EMAIL] Context:`, JSON.stringify(context, null, 2));

    try {
      await mailService.sendMail({
        to: transaction.user.email,
        subject: `⏰ Transaksi Kadaluarsa - ${transaction.event.name}`,
        template: "transaction-expired.html",
        context,
      });

      console.log(
        `✅ EXPIRED email sent successfully to ${transaction.user.email}`
      );
    } catch (error) {
      console.error(
        `❌ Failed to send EXPIRED email to ${transaction.user.email}:`,
        error
      );
      throw error; // Re-throw untuk di-handle oleh caller
    }
  },

  async sendTransactionCancelled(transactionId: string) {
    console.log(
      `📧 Attempting to send CANCELLED email for transaction: ${transactionId}`
    );

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true, coupon: true },
    });

    if (!transaction) {
      const error = `Transaction ${transactionId} not found when sending cancelled email`;
      console.error(`❌ ${error}`);
      throw new Error(error);
    }

    const invoiceId = generateInvoiceId(transaction.id, transaction.createdAt);

    if (!transaction.user?.email) {
      const error = `User email not found for transaction ${transactionId}`;
      console.error(`❌ [EMAIL] ${error}`);
      throw new Error(error);
    }

    const context = {
      userName: transaction.user.name,
      eventName: transaction.event.name,
      transactionId: invoiceId,
      pointsRestored: transaction.pointsUsed,
      couponRestored: transaction.coupon?.code,
      year: new Date().getFullYear(),
    };

    console.log(`📧 [EMAIL] Sending to: ${transaction.user.email}`);
    console.log(`📧 [EMAIL] Context:`, JSON.stringify(context, null, 2));

    try {
      await mailService.sendMail({
        to: transaction.user.email,
        subject: `⚠️ Transaksi Dibatalkan - ${transaction.event.name}`,
        template: "transaction-cancelled.html",
        context,
      });

      console.log(
        `✅ CANCELLED email sent successfully to ${transaction.user.email}`
      );
    } catch (error) {
      console.error(
        `❌ Failed to send CANCELLED email to ${transaction.user.email}:`,
        error
      );
      throw error;
    }
  },
};

import { mailService } from "./mail.service";
import prisma from "../config/prisma.config";
import { CLIENT_URL } from "../config/index.config";
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

    await mailService.sendMail({
      to: transaction.user.email,
      subject: `Menunggu Pembayaran - ${transaction.event.name}`,
      template: "transaction-created.html",
      context: {
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

    // Generate invoice ID sederhana untuk display
    const invoiceId = `INV-${transaction.id.slice(-6).toUpperCase()}`;

    await mailService.sendMail({
      to: transaction.user.email,
      subject: `Tiket Terbit! - ${transaction.event.name}`,
      template: "transaction-accepted.html",
      context: {
        userName: transaction.user.name,
        eventName: transaction.event.name,
        invoiceId: invoiceId,
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

    await mailService.sendMail({
      to: transaction.user.email,
      subject: `Transaksi Ditolak - ${transaction.event.name}`,
      template: "transaction-rejected.html",
      context: {
        userName: transaction.user.name,
        eventName: transaction.event.name,
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
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true, coupon: true },
    });

    if (!transaction) return;

    const context = {
      userName: transaction.user.name,
      eventName: transaction.event.name,
      transactionId: transaction.id,
      pointsRestored: transaction.pointsUsed,
      couponRestored: transaction.coupon?.code,
      year: new Date().getFullYear(),
    };

    await mailService.sendMail({
      to: transaction.user.email,
      subject: `⏰ Transaksi Kadaluarsa - ${transaction.event.name}`,
      template: "transaction-expired.html",
      context,
    });
  },

  async sendTransactionCancelled(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, event: true, coupon: true },
    });

    if (!transaction) return;

    const context = {
      userName: transaction.user.name,
      eventName: transaction.event.name,
      transactionId: transaction.id,
      pointsRestored: transaction.pointsUsed,
      couponRestored: transaction.coupon?.code,
      year: new Date().getFullYear(),
    };

    await mailService.sendMail({
      to: transaction.user.email,
      subject: `⚠️ Transaksi Dibatalkan - ${transaction.event.name}`,
      template: "transaction-cancelled.html",
      context,
    });
  },
};

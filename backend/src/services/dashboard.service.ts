import prisma from "../config/prisma.config";
import {
  IDashboardService,
  AcceptTransactionDTO,
  RejectTransactionDTO,
  TransactionSummary,
  UnauthorizedTransactionError,
  TransactionError,
} from "../@types/transaction.index";
import { TransactionStatus } from "../generated/prisma/client";
import { emailService } from "./notif-mail-transaction.service";
import { transactionService } from "./transaction.service";
import { generateInvoiceId } from "../utils/invoice-generator";

export const dashboardService: IDashboardService = {
  async getOrganizerTransactions(
    organizerId: string
  ): Promise<TransactionSummary[]> {
    const events = await prisma.event.findMany({
      where: {
        organizerId,
        deletedAt: null,
      },
      select: { id: true },
    });

    const eventIds = events.map((e) => e.id);

    if (eventIds.length === 0) return [];

    const transactions = await prisma.transaction.findMany({
      where: { eventId: { in: eventIds } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, name: true } },
        ticketType: { select: { id: true, name: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return transactions.map((t) => ({
      id: t.id,
      invoiceId: generateInvoiceId(t.id, t.createdAt),
      userId: t.userId,
      userName: t.user.name,
      userEmail: t.user.email,
      eventId: t.eventId,
      eventName: t.event.name,
      qty: t.qty,
      totalPrice: t.totalPrice,
      finalPrice: t.finalPrice,
      pointsUsed: t.pointsUsed,
      status: t.status,
      paymentProof: t.paymentProof,
      paymentProofUploadedAt: t.paymentProofUploadedAt,
      expiresAt: t.expiresAt,
      organizerResponseDeadline: t.organizerResponseDeadline,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  },

  async getEventTransactions(
    eventId: string,
    organizerId: string
  ): Promise<TransactionSummary[]> {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId, deletedAt: null },
    });

    if (!event) {
      throw new UnauthorizedTransactionError(
        "Event not found or you don't have access"
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, name: true } },
        ticketType: { select: { id: true, name: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return transactions.map((t) => ({
      id: t.id,
      invoiceId: generateInvoiceId(t.id, t.createdAt),
      userId: t.userId,
      userName: t.user.name,
      userEmail: t.user.email,
      eventId: t.eventId,
      eventName: t.event.name,
      qty: t.qty,
      totalPrice: t.totalPrice,
      finalPrice: t.finalPrice,
      pointsUsed: t.pointsUsed,
      status: t.status,
      paymentProof: t.paymentProof,
      paymentProofUploadedAt: t.paymentProofUploadedAt,
      expiresAt: t.expiresAt,
      organizerResponseDeadline: t.organizerResponseDeadline,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  },

  async acceptTransaction(data: AcceptTransactionDTO) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: data.transactionId },
      include: { event: true },
    });

    if (!transaction) {
      throw new TransactionError("Transaction not found", 404);
    }

    if (transaction.event.organizerId !== data.organizerId) {
      throw new UnauthorizedTransactionError(
        "You don't have permission to accept this transaction"
      );
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new TransactionError(
        `Cannot accept transaction with status: ${transaction.status}`,
        400
      );
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: data.transactionId },
      data: { status: TransactionStatus.DONE },
    });

    try {
      emailService.sendTransactionAccepted(data.transactionId);
    } catch (error) {
      console.error("Failed to send acceptance email:", error);
    }

    return updatedTransaction;
  },

  async rejectTransaction(data: RejectTransactionDTO) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: data.transactionId },
      include: { event: true },
    });

    if (!transaction) {
      throw new TransactionError("Transaction not found", 404);
    }

    if (transaction.event.organizerId !== data.organizerId) {
      throw new UnauthorizedTransactionError(
        "You don't have permission to reject this transaction"
      );
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new TransactionError(
        `Cannot reject transaction with status: ${transaction.status}`,
        400
      );
    }

    const rollbackResult = await transactionService.rollbackTransaction(
      data.transactionId,
      TransactionStatus.REJECTED
    );

    const rejectionReason = data.reason || "Pembayaran tidak valid.";

    try {
      emailService.sendTransactionRejected(data.transactionId, rejectionReason);
    } catch (error) {
      console.error("Failed to send acceptance email:", error);
    }

    return rollbackResult;
  },

  async getRevenueStats(
    organizerId: string,
    period: "day" | "month" | "year"
  ): Promise<Record<string, number>> {
    // Get all events for this organizer
    const events = await prisma.event.findMany({
      where: {
        organizerId,
        deletedAt: null,
      },
      select: { id: true },
    });

    const eventIds = events.map((e) => e.id);

    if (eventIds.length === 0) return {};

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === "day") {
      // TODAY ONLY: from 00:00:00 to 23:59:59 TODAY
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );
    } else if (period === "month") {
      // CURRENT MONTH: from 1st to last day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
    } else {
      // CURRENT YEAR: from Jan 1 to Dec 31 of current year
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    console.log(`[Dashboard] Period: ${period}`);
    console.log(
      `[Dashboard] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    // ✅ Query transactions with date filter
    const transactions = await prisma.transaction.findMany({
      where: {
        eventId: { in: eventIds },
        status: TransactionStatus.DONE,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        finalPrice: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(`[Dashboard] Found ${transactions.length} transactions`);

    if (transactions.length === 0) return {};

    // Group and aggregate based on period
    const stats: Record<string, number> = {};

    if (period === "day") {
      // HARIAN: Show only TODAY with single entry
      let totalToday = 0;

      transactions.forEach((t) => {
        totalToday += t.finalPrice;
      });

      const todayKey = now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });

      stats[todayKey] = totalToday;

      console.log(`[Dashboard] Day stats:`, stats);
    } else if (period === "month") {
      // BULANAN: Show each DAY in current month
      // Format: "1 Des", "2 Des", "3 Des", ...

      transactions.forEach((t) => {
        const date = new Date(t.createdAt);
        const dayKey = date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });

        stats[dayKey] = (stats[dayKey] || 0) + t.finalPrice;
      });

      // Sort by day number
      const sortedStats: Record<string, number> = {};
      Object.keys(stats)
        .sort((a, b) => {
          const dayA = parseInt(a.split(" ")[0]);
          const dayB = parseInt(b.split(" ")[0]);
          return dayA - dayB;
        })
        .forEach((key) => {
          sortedStats[key] = stats[key];
        });

      console.log(`[Dashboard] Month stats:`, sortedStats);
      return sortedStats;
    } else {
      // TAHUNAN: Show each MONTH in current year
      // Format: "Jan", "Feb", "Mar", ...

      transactions.forEach((t) => {
        const date = new Date(t.createdAt);
        const monthKey = date.toLocaleDateString("id-ID", {
          month: "short",
        });

        stats[monthKey] = (stats[monthKey] || 0) + t.finalPrice;
      });

      // Sort by month order
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      const sortedStats: Record<string, number> = {};

      monthOrder.forEach((month) => {
        if (stats[month]) {
          sortedStats[month] = stats[month];
        }
      });

      console.log(`[Dashboard] Year stats:`, sortedStats);
      return sortedStats;
    }

    return stats;
  },

  async getRecentTransactions(
    organizerId: string,
    limit: number = 5
  ): Promise<TransactionSummary[]> {
    const events = await prisma.event.findMany({
      where: {
        organizerId,
        deletedAt: null,
      },
      select: { id: true },
    });

    const eventIds = events.map((e) => e.id);

    if (eventIds.length === 0) return [];

    const transactions = await prisma.transaction.findMany({
      where: {
        eventId: { in: eventIds },
        status: {
          in: [
            TransactionStatus.DONE, // ✅ Transaksi berhasil
            TransactionStatus.WAITING_CONFIRMATION, // ⏳ Menunggu approval organizer
            TransactionStatus.WAITING_PAYMENT, // ⏳ Menunggu customer upload bukti
          ],
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, name: true } },
        ticketType: { select: { id: true, name: true, price: true } },
      },
      // Prioritaskan transaksi yang butuh action
      orderBy: [
        {
          // WAITING_CONFIRMATION dulu (butuh approval organizer - highest priority)
          status: "asc", // WAITING_PAYMENT < WAITING_CONFIRMATION < DONE
        },
        {
          createdAt: "desc", // Kemudian sort by tanggal terbaru
        },
      ],
      // ✅ LIMIT: Hanya ambil N transaksi terakhir
      take: limit,
    });

    return transactions.map((t) => ({
      id: t.id,
      invoiceId: generateInvoiceId(t.id, t.createdAt),
      userId: t.userId,
      userName: t.user.name,
      userEmail: t.user.email,
      eventId: t.eventId,
      eventName: t.event.name,
      qty: t.qty,
      totalPrice: t.totalPrice,
      finalPrice: t.finalPrice,
      pointsUsed: t.pointsUsed,
      status: t.status,
      paymentProof: t.paymentProof,
      paymentProofUploadedAt: t.paymentProofUploadedAt,
      expiresAt: t.expiresAt,
      organizerResponseDeadline: t.organizerResponseDeadline,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  },

  async getEventAttendees(
    eventId: string,
    organizerId: string
  ): Promise<TransactionSummary[]> {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId, deletedAt: null },
    });

    if (!event) {
      throw new UnauthorizedTransactionError(
        "Event not found or you don't have access"
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        eventId,
        status: TransactionStatus.DONE,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        event: {
          select: { id: true, name: true },
        },
        ticketType: {
          select: { id: true, name: true, price: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return transactions.map((t) => ({
      id: t.id,
      invoiceId: generateInvoiceId(t.id, t.createdAt),
      userId: t.userId,
      userName: t.user.name,
      userEmail: t.user.email,
      eventId: t.eventId,
      eventName: t.event.name,
      qty: t.qty,
      totalPrice: t.totalPrice,
      finalPrice: t.finalPrice,
      pointsUsed: t.pointsUsed,
      status: t.status,
      paymentProof: t.paymentProof,
      paymentProofUploadedAt: t.paymentProofUploadedAt,
      expiresAt: t.expiresAt,
      organizerResponseDeadline: t.organizerResponseDeadline,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  },
};

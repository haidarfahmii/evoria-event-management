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
import { emailService } from "./email.service";
import { transactionService } from "./transaction.service";

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
      await emailService.sendTransactionAccepted(data.transactionId);
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

    try {
      await emailService.sendTransactionRejected(
        data.transactionId,
        data.reason
      );
    } catch (error) {
      console.error("Failed to send rejection email:", error);
    }

    return rollbackResult;
  },

  async getRevenueStats(
    organizerId: string,
    period: "day" | "month" | "year"
  ): Promise<Record<string, number>> {
    const events = await prisma.event.findMany({
      where: {
        organizerId,
        deletedAt: null,
      },
      select: { id: true },
    });

    const eventIds = events.map((e) => e.id);

    if (eventIds.length === 0) return {};

    const transactions = await prisma.transaction.findMany({
      where: {
        eventId: { in: eventIds },
        status: TransactionStatus.DONE,
      },
      select: { finalPrice: true, createdAt: true },
    });

    const stats: Record<string, number> = {};

    transactions.forEach((t) => {
      let key: string;
      const date = new Date(t.createdAt);

      if (period === "day") {
        key = date.toISOString().split("T")[0];
      } else if (period === "month") {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        key = `${year}-${month}`;
      } else {
        key = String(date.getFullYear());
      }

      stats[key] = (stats[key] || 0) + t.finalPrice;
    });

    return stats;
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

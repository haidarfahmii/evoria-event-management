import prisma from "../config/prisma.config";
import {
  ITransactionService,
  CreateTransactionDTO,
  UploadPaymentProofDTO,
  TransactionWithRelations,
  TransactionSummary,
  RollbackResult,
  TransactionExpiredError,
} from "../@types/transaction.index";
import { Transaction, TransactionStatus } from "../generated/prisma/client";
import { AppError } from "../utils/app-error";
import { emailService } from "./email.service";

export const transactionService: ITransactionService = {
  // Rollback Transaction
  async rollbackTransaction(
    transactionId: string,
    reason: TransactionStatus
  ): Promise<RollbackResult> {
    console.log(
      `🔄 Rolling back transaction ${transactionId} - Reason: ${reason}`
    );

    // get data transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { ticketType: true, coupon: true },
    });

    if (!transaction) throw AppError("Transaction not found", 404);

    await prisma.$transaction(async (tx) => {
      // Restore Seats
      if (transaction.ticketTypeId) {
        await tx.ticketType.update({
          where: { id: transaction.ticketTypeId },
          data: { seats: { increment: transaction.qty } },
        });
        console.log(`  ✅ Restored ${transaction.qty} seats`);
      }
      // Restore Coupon
      if (transaction.couponId) {
        await tx.coupon.update({
          where: { id: transaction.couponId },
          data: { isUsed: false },
        });
        console.log(`  ✅ Restored coupon: ${transaction.coupon?.code}`);
      }
      // Restore Points
      if (transaction.pointsUsed > 0) {
        await tx.point.create({
          data: {
            userId: transaction.userId,
            amount: transaction.pointsUsed,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 bulan
          },
        });
        console.log(`  ✅ Restored ${transaction.pointsUsed} points`);
      }
      // Update Status
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: reason },
      });
      console.log(`  ✅ Updated status to ${reason}`);
    });

    // Send email notification based on reason
    try {
      if (reason === TransactionStatus.EXPIRED) {
        await emailService.sendTransactionExpired(transactionId);
      } else if (reason === TransactionStatus.CANCELLED) {
        await emailService.sendTransactionCancelled(transactionId);
      } else if (reason === TransactionStatus.REJECTED) {
        // Email untuk reject sudah dikirim dari Feature 6
        console.log("  ℹ️ Rejection email handled by Feature 6");
      }
    } catch (error) {
      console.error("Failed to send rollback email:", error);
    }

    return {
      transactionId,
      seatsRestored: transaction.qty,
      pointsRestored: transaction.pointsUsed,
      couponRestored: transaction.coupon?.code || null,
      reason,
    };
  },

  // Create Transaction (Customer Flow)
  async createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
    const {
      userId,
      eventId,
      ticketTypeId,
      qty,
      pointsUsed = 0,
      couponId,
      promotionId,
    } = data;

    return await prisma.$transaction(async (tx) => {
      // Check Ticket & Seats
      const ticket = await tx.ticketType.findUnique({
        where: { id: ticketTypeId },
      });
      if (!ticket) throw AppError("Ticket not found", 404);
      if (ticket.seats < qty) throw AppError("Not enough seats available", 400);

      // Calculate Price
      const totalPrice = ticket.price * qty;
      let currentPrice = totalPrice; // harga berjalan setelah diskon

      // Handle Promotion
      if (promotionId) {
        const promotion = await tx.promotion.findUnique({
          where: { id: promotionId },
        });

        // Validasi tanggal promosi
        const now = new Date();
        if (
          !promotion ||
          now < promotion.startDate ||
          now > promotion.endDate
        ) {
          throw AppError("Promotion is invalid or expired", 400);
        }

        if (promotion.type === "PERCENTAGE") {
          const promoDiscount = (totalPrice * promotion.value) / 100;
          currentPrice -= promoDiscount;
        } else if (promotion.type === "FLAT") {
          currentPrice -= promotion.value;
        }
      }

      // Handle Coupon
      if (couponId) {
        const coupon = await tx.coupon.findUnique({ where: { id: couponId } });

        // validasi kepemilikan dan tanggal kupon
        if (!coupon || coupon.isUsed)
          throw AppError("Invalid or used coupon", 400);
        if (coupon.isUsed) throw AppError("Coupon already used", 400);
        if (coupon.expiresAt < new Date())
          throw AppError("Coupon expired", 400);

        // Hitung diskon kupon
        const couponDiscount = (totalPrice * coupon.percentage) / 100;
        currentPrice -= couponDiscount;

        // tandai kupon sudah terpakai
        await tx.coupon.update({
          where: { id: couponId },
          data: { isUsed: true },
        });
      }

      // logic points dengan FIFO
      if (pointsUsed > 0) {
        // ambil point yang belum expire dan belum habis serta urutkan berdasarkan expire 'ASC'
        const availablePoints = await tx.point.findMany({
          where: {
            userId,
            isRedeemed: false,
            expiresAt: { gt: new Date() }, // untuk memastikan point belum expire
          },
          orderBy: { expiresAt: "asc" }, // untuk memastikan point yang paling dekat dengan expire diambil
        });

        // cek total saldo
        const totalAvailable = availablePoints.reduce(
          (sum, p) => sum + p.amount,
          0
        );
        if (totalAvailable < pointsUsed) {
          throw AppError(
            `Insufficient points. Available: ${totalAvailable}, Required: ${pointsUsed}`,
            400
          );
        }

        // proses pemotongan
        let remainingToDeduct = pointsUsed;

        for (const batch of availablePoints) {
          if (remainingToDeduct <= 0) break;

          if (batch.amount <= remainingToDeduct) {
            // kasus 1: batch ini lebih kecil atau sama dengan yang dibutuh dipotong
            // potong semua point ini
            await tx.point.update({
              where: { id: batch.id },
              data: {
                amount: 0,
                isRedeemed: true,
              },
            });
            remainingToDeduct -= batch.amount;
          } else {
            // kasus 2: batch ini lebih besar dari yang dibutuh dipotong
            // potong sejumlah yang dibutuh
            await tx.point.update({
              where: { id: batch.id },
              data: { amount: batch.amount - remainingToDeduct },
            });
            remainingToDeduct = 0;
          }
        }

        // kurangi harga akhir dengan poin
        currentPrice -= pointsUsed;
      }

      // Final Check: Harga tidak boleh negatif
      const finalPrice = Math.max(0, currentPrice);

      // update seats
      await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: {
          seats: {
            decrement: qty,
          },
        },
      });

      // Create Transaction
      return await tx.transaction.create({
        data: {
          userId,
          eventId,
          ticketTypeId,
          qty,
          totalPrice,
          pointsUsed,
          couponId,
          promotionId,
          finalPrice,
          status: TransactionStatus.WAITING_PAYMENT,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        },
      });
    });
  },

  // Upload Payment Proof
  async uploadPaymentProof(data: UploadPaymentProofDTO): Promise<Transaction> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: data.transactionId },
    });

    if (!transaction) throw AppError("Transaction not found", 404);

    // verify ownership
    if (transaction.userId !== data.userId) {
      throw AppError("Unauthorized", 403);
    }

    // cek expired
    if (transaction.expiresAt && new Date() > transaction.expiresAt) {
      throw new TransactionExpiredError();
    }

    // Validasi status
    if (transaction.status !== TransactionStatus.WAITING_PAYMENT) {
      throw AppError(
        `Cannot upload payment proof for transaction with status: ${transaction.status}`,
        400
      );
    }

    return await prisma.transaction.update({
      where: { id: data.transactionId },
      data: {
        paymentProof: data.paymentProofUrl,
        paymentProofUploadedAt: new Date(),
        status: TransactionStatus.WAITING_CONFIRMATION,
        organizerResponseDeadline: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ), // 3 days
      },
    });
  },

  async getUserTransactions(userId: string): Promise<TransactionSummary[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    // Manual mapping to match interface TransactionSummary
    return transactions.map((t) => ({
      ...t,
      userName: t.user.name,
      userEmail: t.user.email,
      eventName: t.event.name,
    }));
  },

  async getTransactionById(
    id: string
  ): Promise<TransactionWithRelations | null> {
    return (await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            city: true,
            venue: true,
            organizerId: true,
          },
        },
        ticketType: { select: { id: true, name: true, price: true } },
        coupon: { select: { id: true, code: true, percentage: true } },
        promotion: {
          select: { id: true, code: true, type: true, value: true },
        },
      },
    })) as any;
  },

  async canModifyTransaction(id: string): Promise<boolean> {
    const t = await prisma.transaction.findUnique({ where: { id } });
    return t
      ? (
          [
            TransactionStatus.WAITING_PAYMENT,
            TransactionStatus.WAITING_CONFIRMATION,
          ] as TransactionStatus[]
        ).includes(t.status)
      : false;
  },
};

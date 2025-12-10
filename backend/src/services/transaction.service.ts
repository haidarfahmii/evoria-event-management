import prisma from "../config/prisma.config";
import {
  ITransactionService,
  CreateTransactionDTO,
  UploadPaymentProofDTO,
  TransactionWithRelations,
  TransactionSummary,
  RollbackResult,
  TransactionExpiredError,
  CreatePromotionDTO,
  PromotionSummary,
} from "../@types/transaction.index";
import {
  Transaction,
  TransactionStatus,
  Promotion,
  Prisma,
} from "../generated/prisma/client";
import { AppError } from "../utils/app-error";
import { emailService } from "./notif-mail-transaction.service";
import { generateInvoiceId } from "../utils/invoice-generator";

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
      include: {
        ticketType: true,
        coupon: true,
        promotion: true,
      },
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

      // BARU: Restore Promotion
      if (transaction.promotionId) {
        const promotion = await tx.promotion.findUnique({
          where: { id: transaction.promotionId },
        });

        // Increment maxUsage kembali (karena sebelumnya di-decrement 1)
        if (promotion && promotion.maxUsage !== null) {
          await tx.promotion.update({
            where: { id: transaction.promotionId },
            data: {
              maxUsage: {
                increment: 1, // ✅ Kembalikan 1 quota (bukan qty!)
              },
            },
          });
          console.log(
            `  ✅ Restored promotion: ${transaction.promotion?.code} (quota +1)`
          );
        }
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

    return {
      transactionId,
      seatsRestored: transaction.qty,
      pointsRestored: transaction.pointsUsed,
      couponRestored: transaction.coupon?.code || null,
      promotionRestored: transaction.promotion?.code || null,
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

    // Pengecekan apakah user sudah pernah membeli tiket ini

    const eventData = await prisma.event.findUnique({
      where: { id: eventId },
      select: { endDate: true, organizerId: true },
    });

    if (!eventData) throw AppError("Event not found", 404);

    if (eventData.organizerId === userId) {
      throw AppError("You cannot buy a ticket for your own event.", 403);
    }

    if (new Date() < eventData.endDate) {
      const existingActiveTicket = await prisma.transaction.findFirst({
        where: {
          userId,
          eventId,
          status: {
            in: [
              TransactionStatus.DONE,
              TransactionStatus.WAITING_PAYMENT,
              TransactionStatus.WAITING_CONFIRMATION,
            ],
          },
          OR: [
            { status: TransactionStatus.DONE },
            {
              status: {
                in: [
                  TransactionStatus.WAITING_PAYMENT,
                  TransactionStatus.WAITING_CONFIRMATION,
                ],
              },
              expiresAt: { gt: new Date() },
            },
            {
              status: TransactionStatus.WAITING_CONFIRMATION,
              organizerResponseDeadline: { gt: new Date() },
            },
          ],
        },
      });

      if (existingActiveTicket) {
        // Pengguna sudah memiliki tiket (lunas atau sedang dalam proses pembayaran/konfirmasi)
        throw AppError("You already bought a ticket for this event.", 409);
      }
    }

    const newTransaction = await prisma.$transaction(async (tx) => {
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

        if (!promotion) {
          throw AppError("Promotion not found", 404);
        }

        // Validasi 1: Cek tanggal promosi
        const now = new Date();
        if (now < promotion.startDate || now > promotion.endDate) {
          throw AppError("Promotion is invalid or expired", 400);
        }

        // Validasi 2: Cek apakah promotion untuk event ini
        if (promotion.eventId !== eventId) {
          throw AppError("Promotion code tidak valid untuk event ini", 400);
        }

        // Validasi 3: Cek kuota total (maxUsage)
        if (promotion.maxUsage !== null && promotion.maxUsage <= 0) {
          throw AppError("Kuota promosi sudah habis", 400);
        }

        // Hitung Diskon - Diskon dihitung dari totalPrice
        // totalPrice = price * qty sudah dihitung sebelumnya
        let promoDiscount = 0;

        if (promotion.type === "PERCENTAGE") {
          // Diskon dari TOTAL HARGA (price * qty)
          promoDiscount = Math.floor((totalPrice * promotion.value) / 100);
        } else if (promotion.type === "FLAT") {
          // Diskon flat tetap (tidak dikalikan qty)
          // Contoh: diskon Rp 50.000 tetap Rp 50.000
          promoDiscount = promotion.value;
        }

        if (promotion.maxUsage! <= 0) {
          throw AppError("Promotion maxUsage is reached!", 400);
          // Cap diskon agar tidak melebihi total harga
        }
        if (promoDiscount > totalPrice) {
          promoDiscount = totalPrice;
        }

        currentPrice -= promoDiscount;

        // Update kuota promotion
        // Decrement by 1 (BUKAN by qty) karena 1 transaksi = 1 penggunaan
        if (promotion.maxUsage !== null) {
          await tx.promotion.update({
            where: { id: promotionId },
            data: {
              maxUsage: {
                decrement: 1, // decrement 1, bukan qty
              },
            },
          });
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

      // Kondisi jika harga Ticket Price Free
      const isFreeTransaction = finalPrice === 0;

      let transactionStatus: TransactionStatus;
      let expirationDate: Date | null = null;
      let organizerDeadline: Date | null = null;

      if (isFreeTransaction) {
        // Jika free
        transactionStatus = TransactionStatus.WAITING_CONFIRMATION;
        organizerDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
      } else {
        // Jika berbayar
        transactionStatus = TransactionStatus.WAITING_PAYMENT;
        expirationDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      }

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
          status: transactionStatus,
          expiresAt: expirationDate,
          organizerResponseDeadline: organizerDeadline,
        },
      });
    });

    if (newTransaction.status === TransactionStatus.WAITING_PAYMENT) {
      emailService.sendTransactionCreated(newTransaction.id).catch((err) => {
        console.error("Failed to send transaction created email", err);
      });
    }

    // Return hasil transaksi
    return newTransaction;
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
        event: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            venue: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    // Manual mapping to match interface TransactionSummary
    return transactions.map((t) => ({
      ...t,
      invoiceId: generateInvoiceId(t.id, t.createdAt),
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

  async createPromotion(data: CreatePromotionDTO): Promise<Promotion> {
    const { eventId, code, type, value, maxUsage, startDate, endDate } = data;

    // 1. Validate: Event Existence
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw AppError("Event not found", 404);

    // 2. Validate: Date Logic
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw AppError("End date must be greater than start date", 400);
    }

    // 3. Validate: Unique Code per Event
    // Check if this code already exists for this specific event to avoid duplicates
    const existingPromo = await prisma.promotion.findFirst({
      where: {
        code: code,
        eventId: eventId,
      },
    });

    if (existingPromo) {
      throw AppError("Promotion code already exists for this event", 400);
    }

    return await prisma.promotion.create({
      data: {
        eventId,
        code,
        type,
        value,
        maxUsage,
        startDate: start,
        endDate: end,
      },
    });
  },

  async getPromotionByEventId(eventId: string): Promise<PromotionSummary[]> {
    return await prisma.promotion.findMany({
      where: {
        eventId: eventId, // Convert string to number (remove Number() if using UUIDs)
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getPromotionById(id: string): Promise<PromotionSummary | null> {
    return await prisma.promotion.findUnique({
      where: {
        id: id,
      },
    });
  },

  async deletePromotionByEventId(
    eventId: string
  ): Promise<Prisma.BatchPayload> {
    return await prisma.promotion.deleteMany({
      where: {
        eventId: eventId,
      },
    });
  },

  async deletePromotionById(id: string): Promise<PromotionSummary | null> {
    return await prisma.promotion.delete({
      where: {
        id: id,
      },
    });
  },
};

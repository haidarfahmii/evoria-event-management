import { Request, Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service";
import {
  CreatePromotionDTO,
  CreateTransactionDTO,
  UploadPaymentProofDTO,
} from "../@types/transaction.index";
import { AppError } from "../utils/app-error";

export const transactionController = {
  /**
   * Create new transaction (Customer beli tiket)
   * POST /api/transactions
   */
  async create(req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;
    const { eventId, ticketTypeId, qty, pointsUsed, couponId, promotionId } =
      req.body;

    // Validasi manual jika diperlukan (selain express-validator)
    if (!userId) throw AppError("Unauthorized", 401);

    const data: CreateTransactionDTO = {
      userId,
      eventId,
      ticketTypeId,
      qty: Number(qty), // Pastikan format number
      pointsUsed: pointsUsed ? Number(pointsUsed) : 0,
      couponId,
      promotionId,
    };

    const transaction = await transactionService.createTransaction(data);

    res.status(201).json({
      success: true,
      message:
        "Transaction created successfully. Please upload payment proof within 2 hours.",
      data: { transaction },
    });
  },

  /**
   * Upload payment proof
   * PATCH /api/transactions/:transactionId/upload-payment
   */
  async uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;
    const { transactionId } = req.params;

    if (!req.file) {
      throw AppError("Payment proof image is required", 400);
    }

    const paymentProofUrl = req.file.path; // Cloudinary URL

    const data: UploadPaymentProofDTO = {
      transactionId,
      paymentProofUrl,
      userId,
    };

    const transaction = await transactionService.uploadPaymentProof(data);

    res.status(200).json({
      success: true,
      message:
        "Payment proof uploaded successfully. Waiting for organizer confirmation.",
      data: { transaction },
    });
  },

  /**
   * Get user transactions
   * GET /api/transactions/my-transactions
   */
  async getUserTransactions(_req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;

    if (!userId) throw AppError("Unauthorized", 401);

    const transactions = await transactionService.getUserTransactions(userId);

    res.status(200).json({
      success: true,
      message: "User transactions retrieved successfully",
      data: {
        transactions,
        total: transactions.length,
      },
    });
  },

  /**
   * Get transaction by ID
   * GET /api/transactions/:transactionId
   */
  async getTransactionById(req: Request, res: Response, next: NextFunction) {
    const { transactionId } = req.params;
    const requestingUserId = res?.locals?.payload?.userId;
    const requestingUserRole = res?.locals?.payload?.role;

    const transaction = await transactionService.getTransactionById(
      transactionId
    );

    if (!transaction) {
      throw AppError("Transaction not found", 404);
    }

    // Jika yang request adalah CUSTOMER:
    // Dia haruslah pemilik transaksi tersebut
    if (requestingUserRole === "CUSTOMER") {
      if (transaction.userId !== requestingUserId) {
        throw AppError("Unauthorized: You do not own this transaction", 403);
      }
    }

    // Jika yang request adalah ORGANIZER:
    // Dia haruslah pemilik EVENT yang ada di transaksi tersebut
    if (requestingUserRole === "ORGANIZER") {
      if (transaction.event.organizerId !== requestingUserId) {
        throw AppError(
          "Unauthorized: This transaction belongs to an event you do not organize",
          403
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Transaction retrieved successfully",
      data: { transaction },
    });
  },
  /*
    Create new Promotion (Organizer membuat promotion pada event)
    POST /:eventId/create-promotion
  */
  async createPromotion(req: Request, res: Response, next: NextFunction) {
    const { code, type, value, maxUsage, startDate, endDate } = req.body;
    const { eventId } = req.params;

    const data: CreatePromotionDTO = {
      eventId,
      code,
      type,
      value: Number(value),
      maxUsage: Number(maxUsage),
      startDate,
      endDate
    }

    const promotion = await transactionService.createPromotion(data)

    res.status(201).json({
      success: true,
      message: "Event Promotion created successfully",
      data: {
        promotion
      }
    })
  },

  /**
   * Get Promotion by Event ID
   */
  async getPromotionByEventId(req: Request, res: Response, next: NextFunction) {
    const { eventId } = req.params;

    const promotion = await transactionService.getPromotionByEventId(eventId)

    res.status(200).json({
      success: true,
      message: "Event Promotion retrieved by Event ID successfully",
      data: {
        promotion
      }
    })
  },

  /**
   * Get Promotion by ID
   */
  async getPromotionbyId(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const promotion = await transactionService.getPromotionById(id)

    res.status(200).json({
      success: true,
      message: "Event Promotion retrieved by Promotion ID successfully",
      data: {
        promotion
      }
    })
  },

  async deletePromotionByEventId(req: Request, res: Response, next: NextFunction) {
    const { eventId } = req.params;

    const promotion = await transactionService.deletePromotionByEventId(eventId)

    res.status(200).json({
      success: true,
      message: "Event Promotion retrieved by Event ID successfully",
      data: {
        promotion
      }
    })
  },

  async deletePromotionById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const promotion = await transactionService.deletePromotionById(id)

    res.status(200).json({
      success: true,
      message: "Delete Promotion by Promotion ID successfully",
      data: {
        promotion
      }
    })
  }
};


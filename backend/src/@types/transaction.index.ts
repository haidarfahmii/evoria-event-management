import {
  TransactionStatus,
  Transaction,
  User,
  Event,
  TicketType,
  Coupon,
  Promotion,
} from "../generated/prisma/client";

// DTO (Data Transfer Object)
export interface CreateTransactionDTO {
  userId: string;
  eventId: string;
  ticketTypeId: string;
  qty: number;
  pointsUsed?: number;
  couponId?: string;
  promotionId?: string;
}

export interface UploadPaymentProofDTO {
  transactionId: string;
  paymentProofUrl: string;
  userId: string;
}

export interface AcceptTransactionDTO {
  transactionId: string;
  organizerId: string;
}

export interface RejectTransactionDTO {
  transactionId: string;
  organizerId: string;
  reason?: string;
}

export interface TransactionWithRelations extends Transaction {
  user: Pick<User, "id" | "name" | "email">;
  event: Pick<
    Event,
    "id" | "name" | "startDate" | "endDate" | "city" | "venue" | "organizerId"
  >;
  ticketType: Pick<TicketType, "id" | "name" | "price"> | null;
  coupon: Pick<Coupon, "id" | "code" | "percentage"> | null;
  promotion: Pick<Promotion, "id" | "code" | "type" | "value"> | null;
}

/**
 * Response untuk transaction summary (untuk dashboard)
 */

export interface TransactionSummary {
  id: string;
  invoiceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: string;
  eventName: string;
  qty: number;
  totalPrice: number;
  finalPrice: number;
  pointsUsed: number;
  status: TransactionStatus;
  paymentProof: string | null;
  paymentProofUploadedAt: Date | null;
  expiresAt: Date | null;
  organizerResponseDeadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rollback result untuk tracking
 */
export interface RollbackResult {
  transactionId: string;
  seatsRestored: number;
  pointsRestored: number;
  couponRestored: string | null;
  reason: TransactionStatus;
}

/**
 * Service interface
 */

export interface ITransactionService {
  createTransaction(data: CreateTransactionDTO): Promise<Transaction>;
  uploadPaymentProof(data: UploadPaymentProofDTO): Promise<Transaction>;
  rollbackTransaction(
    transactionId: string,
    reason: TransactionStatus
  ): Promise<RollbackResult>;
  getTransactionById(
    transactionId: string
  ): Promise<TransactionWithRelations | null>;
  getUserTransactions(userId: string): Promise<TransactionSummary[]>;
  canModifyTransaction(transactionId: string): Promise<boolean>;
}

export interface IDashboardService {
  getOrganizerTransactions(organizerId: string): Promise<TransactionSummary[]>;
  getEventTransactions(
    eventId: string,
    organizerId: string
  ): Promise<TransactionSummary[]>;
  acceptTransaction(data: AcceptTransactionDTO): Promise<Transaction>;
  rejectTransaction(data: RejectTransactionDTO): Promise<RollbackResult>;
  getRevenueStats(
    organizerId: string,
    period: "day" | "month" | "year"
  ): Promise<Record<string, number>>;
  getEventAttendees(
    eventId: string,
    organizerId: string
  ): Promise<TransactionSummary[]>;
}

export interface IEmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
  sendTransactionCreated(transactionId: string): Promise<void>;
  sendPaymentReminder(transactionId: string): Promise<void>;
  sendTransactionAccepted(transactionId: string): Promise<void>;
  sendTransactionRejected(
    transactionId: string,
    reason?: string
  ): Promise<void>;
  sendTransactionExpired(transactionId: string): Promise<void>;
  sendTransactionCancelled(transactionId: string): Promise<void>;
}

/**
 * Error types
 */

export class TransactionError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "TransactionError";
  }
}

export class UnauthorizedTransactionError extends TransactionError {
  constructor(message: string = "Unauthorized to access this transaction") {
    super(message, 403, "UNAUTHORIZED_TRANSACTION");
  }
}

export class TransactionExpiredError extends TransactionError {
  constructor(message: string = "Transaction has expired") {
    super(message, 400, "TRANSACTION_EXPIRED");
  }
}

export class InsufficientSeatsError extends TransactionError {
  constructor(message: string = "Not enough seats available") {
    super(message, 400, "INSUFFICIENT_SEATS");
  }
}

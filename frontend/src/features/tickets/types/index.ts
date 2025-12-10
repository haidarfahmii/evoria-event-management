export enum TransactionStatus {
  WAITING_PAYMENT = "WAITING_PAYMENT",
  WAITING_CONFIRMATION = "WAITING_CONFIRMATION",
  DONE = "DONE",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Event {
  id: string;
  name: string;
  imageUrl?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
}

export interface Transaction {
  id: string;
  invoiceId: string;
  userId: string;
  eventId: string;
  ticketTypeId: string;
  qty: number;
  totalPrice: number;
  pointsUsed: number;
  couponId: string | null;
  promotionId: string | null;
  finalPrice: number;
  status: TransactionStatus;
  paymentProof: string | null;
  paymentProofUploadedAt: string | null;
  expiresAt: string | null;
  organizerResponseDeadline: string | null;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  event: Event;
  userName: string;
  userEmail: string;
  eventName: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    total: number;
  };
}

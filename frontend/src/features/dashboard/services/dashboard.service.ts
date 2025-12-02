import axiosInstance from "@/utils/axiosInstance";
import { TransactionStatus } from "@/@types";

export interface TransactionItem {
  id: string;
  invoiceId: string;
  userName: string;
  userEmail: string;
  eventName: string;
  qty: number;
  totalPrice: number;
  finalPrice: number;
  status: TransactionStatus;
  paymentProof: string | null;
  paymentProofUploadedAt: string | null;
  createdAt: string;
}

export const dashboardService = {
  // ambil daftar transaksi yang spesifik untuk 1 event
  getEventTransactions: async (eventId: string): Promise<TransactionItem[]> => {
    const response = await axiosInstance.get(
      `/dashboard/events/${eventId}/transactions`
    );
    console.log("data dari dashboard service", response.data);
    return response.data?.data?.transactions || [];
  },

  // api untuk approve
  acceptTransaction: async (transactionId: string): Promise<void> => {
    const response = await axiosInstance.patch(
      `/dashboard/transactions/${transactionId}/accept`
    );
    return response.data;
  },

  // api untuk reject
  rejectTransaction: async (
    transactionId: string,
    reason: string
  ): Promise<void> => {
    const response = await axiosInstance.patch(
      `/dashboard/transactions/${transactionId}/reject`,
      { reason }
    );
    return response.data;
  },

  // api untuk kehadiran
  getAttendees: async (eventId: string): Promise<string[]> => {
    const response = await axiosInstance.get(
      `/dashboard/events/${eventId}/attendees`
    );
    return response.data?.data?.attendees || [];
  },
};

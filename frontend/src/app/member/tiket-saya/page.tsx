"use client";

import { Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  TransactionStatus,
  Transaction,
  ApiResponse,
} from "@/features/tickets/types";
import axiosInstance from "@/utils/axiosInstance";
import { TicketCard } from "@/features/tickets/components/TicketCard";
import { TicketDetailModal } from "@/features/tickets/components/TicketDetailModal";

export default function TiketSayaPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<TransactionStatus | "all">("all");

  // Pindahkan fetch ke fungsi terpisah agar bisa dipanggil ulang
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get<ApiResponse>(
        "/transactions/my-transactions"
      );

      if (data.success) {
        setTransactions(data.data.transactions);
      } else {
        setError(data.message || "Gagal memuat transaksi");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions =
    activeTab === "all"
      ? transactions
      : transactions.filter((t) => t.status === activeTab);

  const tabs = [
    { id: "all", label: "Semua" },
    { id: TransactionStatus.WAITING_PAYMENT, label: "Belum Bayar" },
    {
      id: TransactionStatus.WAITING_CONFIRMATION,
      label: "Menunggu Konfirmasi",
    },
    { id: TransactionStatus.DONE, label: "Selesai" },
    { id: TransactionStatus.REJECTED, label: "Ditolak" },
    { id: TransactionStatus.EXPIRED, label: "Kadaluarsa" },
    { id: TransactionStatus.CANCELLED, label: "Dibatalkan" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tiket Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola tiket dan lihat status pembayaran Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTransactions}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Custom Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const count =
            tab.id === "all"
              ? transactions.length
              : transactions.filter((t) => t.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-[#00388D] text-[#00388D]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Memuat transaksi Anda...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-600 font-medium mb-2">Gagal Memuat Data</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TicketCard
                key={transaction.id}
                transaction={transaction}
                onClick={() => setSelectedTransaction(transaction)}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Ticket size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Belum ada tiket
              </h3>
              <p className="text-gray-500 text-sm">
                Tidak ada transaksi dengan status ini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal Overlay */}
      {selectedTransaction && (
        <TicketDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSuccessUpload={() => {
            fetchTransactions(); // Refresh data setelah upload sukses
          }}
        />
      )}
    </div>
  );
}

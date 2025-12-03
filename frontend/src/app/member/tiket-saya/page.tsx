"use client";

import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  X,
  QrCode,
  Copy,
  Download,
  Share2,
  Filter,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { format } from "date-fns"; // Disarankan pakai date-fns untuk format tanggal
import { id as idLocale } from "date-fns/locale";
import axiosInstance from "@/utils/axiosInstance";

/**
 * ==========================================
 * 1. TYPES & ENUMS (Sesuai API Response)
 * ==========================================
 */

enum TransactionStatus {
  WAITING_PAYMENT = "WAITING_PAYMENT",
  WAITING_CONFIRMATION = "WAITING_CONFIRMATION",
  DONE = "DONE",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Event {
  id: string;
  name: string;
  // Field image, venue, date tidak ada di JSON response contoh,
  // jadi kita akan handle dengan placeholder/optional
  image?: string;
  venue?: string;
  startDate?: string;
}

interface Transaction {
  id: string;
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

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    total: number;
  };
}

/**
 * ==========================================
 * 2. UTILS
 * ==========================================
 */

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper untuk Badge Status dengan warna yang sesuai Enum
const Badge = ({ status }: { status: TransactionStatus }) => {
  const styles: Record<TransactionStatus, string> = {
    WAITING_PAYMENT: "bg-orange-50 text-orange-600 border-orange-200",
    WAITING_CONFIRMATION: "bg-blue-50 text-blue-600 border-blue-200",
    DONE: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
    CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
    EXPIRED: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const labels: Record<TransactionStatus, string> = {
    WAITING_PAYMENT: "Menunggu Pembayaran",
    WAITING_CONFIRMATION: "Menunggu Konfirmasi",
    DONE: "Selesai (E-Voucher)",
    REJECTED: "Ditolak",
    CANCELLED: "Dibatalkan",
    EXPIRED: "Kadaluarsa",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

/**
 * ==========================================
 * 3. COMPONENTS
 * ==========================================
 */

// --- 3.1 Modal Detail Tiket ---
const TicketDetailModal = ({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) => {
  if (!transaction) return null;

  // Placeholder data karena API response contoh tidak lengkap (venue/time)
  const displayDate = format(new Date(transaction.createdAt), "dd MMMM yyyy", { locale: idLocale });
  const displayTime = format(new Date(transaction.createdAt), "HH:mm", { locale: idLocale }) + " WIB";
  const displayVenue = transaction.event.venue || "Venue TBA"; // Fallback jika API tidak ada data

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#F4F7FE] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200 max-h-[90vh] md:max-h-none overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/50 p-2 rounded-full hover:bg-white text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* LEFT SIDE: Visual & Details */}
        <div className="w-full md:w-2/3 bg-white p-6 md:p-8 flex flex-col relative">
          <div className="flex items-center gap-2 mb-6">
            <div className="font-black text-xl text-[#00388D] flex items-center gap-1">
              <Ticket className="w-6 h-6 text-yellow-400" /> EVORIA
            </div>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <span className="text-sm font-semibold text-gray-500">
              E-Ticket / Invoice
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            {transaction.event.name}
          </h2>

          <div className="flex flex-col gap-6 mt-6">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Tanggal Transaksi
                </p>
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <Calendar size={18} className="text-blue-600" /> {displayDate}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Waktu
                </p>
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <Clock size={18} className="text-blue-600" /> {displayTime}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Lokasi
                </p>
                <div className="flex items-start gap-2 text-gray-800 font-semibold">
                  <MapPin size={18} className="text-blue-600 mt-0.5 shrink-0" />{" "}
                  {displayVenue}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col gap-3">
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-xs text-gray-500">Transaction ID</span>
                <span className="text-sm font-mono font-bold text-blue-800 tracking-wider truncate max-w-[150px]">
                  {transaction.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Pembeli</span>
                <span className="text-sm font-semibold text-gray-800">
                  {transaction.userName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Jumlah Tiket</span>
                <span className="text-sm font-semibold text-gray-800">
                  {transaction.qty} Pax
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-xs text-gray-400">
              *Tiket ini valid jika status transaksi <b>DONE</b>.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: QR Code & Actions */}
        <div className="w-full md:w-1/3 bg-gray-50 p-6 md:p-8 flex flex-col items-center justify-center border-l-0 md:border-l-2 border-dashed border-gray-300 relative">

          {/* QR Code hanya jika DONE */}
          {transaction.status === TransactionStatus.DONE ? (
            <>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 w-full max-w-[200px]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${transaction.id}`}
                  alt="QR Code"
                  className="w-full h-full opacity-90"
                />
              </div>
              <p className="text-center text-xs text-gray-500 mb-6">
                Scan QR Code ini di lokasi acara.
              </p>
              <Button className="w-full bg-[#00388D] gap-2 mb-2">
                <Download size={16} /> Download
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-700">Belum Tersedia</h3>
              <p className="text-xs text-gray-500 mt-2">
                QR Code akan muncul setelah pembayaran selesai & dikonfirmasi.
              </p>
              <div className="mt-4">
                <Badge status={transaction.status} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- 3.2 Ticket Card Item ---
const TicketCard = ({
  transaction,
  onClick,
}: {
  transaction: Transaction;
  onClick: () => void;
}) => {
  // Placeholder image jika API tidak menyediakan
  const imageUrl = transaction.event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop";
  const displayDate = format(new Date(transaction.createdAt), "dd MMM yyyy", { locale: idLocale });
  const displayTime = format(new Date(transaction.createdAt), "HH:mm", { locale: idLocale }) + " WIB";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="w-full md:w-48 h-32 md:h-auto shrink-0 relative bg-gray-200">
          <Image
            src={imageUrl}
            alt={transaction.eventName}
            fill
            className="object-cover w-full h-full"
          />
          <div className="absolute top-2 left-2 md:hidden">
            <Badge status={transaction.status} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="hidden md:block mb-2">
                <Badge status={transaction.status} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                {transaction.eventName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} /> {displayDate}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} /> {displayTime}
                </div>
                <div className="flex items-center gap-1">
                  <Ticket size={14} /> {transaction.qty} Tiket
                </div>
              </div>
            </div>

            {/* Price (Desktop) */}
            <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500">Total Harga</span>
              <span className="font-bold text-orange-600 text-lg">
                {formatRupiah(transaction.finalPrice)}
              </span>
            </div>
          </div>

          {/* Footer / Actions */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-hidden w-full md:w-auto">
              <FileText size={14} className="shrink-0" />
              <span className="truncate">ID: {transaction.id}</span>
              <button
                className="text-blue-600 hover:text-blue-800 ml-1 shrink-0"
                title="Copy ID"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(transaction.id)
                }}
              >
                <Copy size={12} />
              </button>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              {/* Mobile Price */}
              <div className="md:hidden flex flex-col">
                <span className="text-[10px] text-gray-500">Total Harga</span>
                <span className="font-bold text-orange-600 text-base">
                  {formatRupiah(transaction.finalPrice)}
                </span>
              </div>

              {/* Action Buttons based on Status */}
              {transaction.status === TransactionStatus.WAITING_PAYMENT && (
                <Button onClick={onClick} size="sm" className="ml-auto bg-orange-500 hover:bg-orange-600">
                  Bayar Sekarang
                </Button>
              )}

              {transaction.status === TransactionStatus.DONE && (
                <Button onClick={onClick} size="sm" className="ml-auto bg-blue-600 hover:bg-blue-700">
                  <QrCode size={16} className="mr-2" /> E-Ticket
                </Button>
              )}

              {transaction.status === TransactionStatus.WAITING_CONFIRMATION && (
                <Button onClick={onClick} size="sm" variant="outline" className="ml-auto">
                  Lihat Detail
                </Button>
              )}

              {(transaction.status === TransactionStatus.EXPIRED || transaction.status === TransactionStatus.CANCELLED) && (
                <Button onClick={onClick} size="sm" variant="secondary" className="ml-auto text-gray-500">
                  Detail
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TiketSayaPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Tab State: 'all' or one of the Enum values
  const [activeTab, setActiveTab] = useState<TransactionStatus | "all">("all");

  // Fetch Data from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get<ApiResponse>("/transactions/my-transactions");

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

    fetchTransactions();
  }, []);

  // Filter Logic
  const filteredTransactions =
    activeTab === "all"
      ? transactions
      : transactions.filter((t) => t.status === activeTab);

  // Tabs Configuration
  const tabs = [
    { id: "all", label: "Semua" },
    { id: TransactionStatus.WAITING_PAYMENT, label: "Belum Bayar" },
    { id: TransactionStatus.WAITING_CONFIRMATION, label: "Menunggu Konfirmasi" },
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
          {/* Contoh tombol refresh manual */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Custom Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          // Hitung count untuk setiap tab
          const count = tab.id === 'all'
            ? transactions.length
            : transactions.filter(t => t.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id
                ? "border-[#00388D] text-[#00388D]"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                  {count}
                </span>
              )}
            </button>
          )
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
        />
      )}
    </div>
  );
}
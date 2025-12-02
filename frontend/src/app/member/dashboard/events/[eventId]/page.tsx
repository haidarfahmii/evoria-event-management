"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  XCircle,
  Search,
  AlertCircle,
  Banknote,
  Ticket,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  dashboardService,
  TransactionItem,
} from "@/features/dashboard/services/dashboard.service";
import { eventService, Event } from "@/features/events/services/event.service";
import { TransactionStatus } from "@/@types";

// Helper Format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

// Helper Badge Status
const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const styles: Record<TransactionStatus, string> = {
    [TransactionStatus.WAITING_PAYMENT]:
      "bg-orange-100 text-orange-700 border-orange-200",
    [TransactionStatus.WAITING_CONFIRMATION]:
      "bg-blue-100 text-blue-700 border-blue-200",
    [TransactionStatus.DONE]: "bg-green-100 text-green-700 border-green-200",
    [TransactionStatus.REJECTED]: "bg-red-100 text-red-700 border-red-200",
    [TransactionStatus.EXPIRED]: "bg-gray-100 text-gray-500 border-gray-200",
    [TransactionStatus.CANCELLED]: "bg-gray-100 text-gray-500 border-gray-200",
  };

  const labels: Record<TransactionStatus, string> = {
    [TransactionStatus.WAITING_PAYMENT]: "Menunggu Bayar",
    [TransactionStatus.WAITING_CONFIRMATION]: "Perlu Verifikasi",
    [TransactionStatus.DONE]: "Selesai",
    [TransactionStatus.REJECTED]: "Ditolak",
    [TransactionStatus.EXPIRED]: "Kadaluarsa",
    [TransactionStatus.CANCELLED]: "Dibatalkan",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

export default function EventReportPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">(
    "ALL"
  );

  // Modal Verification State
  const [selectedTrx, setSelectedTrx] = useState<TransactionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Data
  const fetchData = async () => {
    if (!eventId) return;
    try {
      setLoading(true);

      // Gunakan Promise.all untuk fetch paralel agar lebih cepat
      const [eventsData, trxData] = await Promise.all([
        eventService.getOrganizerEvents(),
        dashboardService.getEventTransactions(eventId),
      ]);

      const currentEvent = eventsData.find((e) => e.id === eventId);
      if (currentEvent) setEvent(currentEvent);

      // Pastikan trxData adalah array
      setTransactions(Array.isArray(trxData) ? trxData : []);
    } catch (error) {
      console.error("Error loading report:", error);
      toast.error("Gagal memuat laporan event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const handleVerify = async (action: "ACCEPT" | "REJECT") => {
    if (!selectedTrx) return;

    if (action === "REJECT" && !rejectReason) {
      toast.warning("Mohon sertakan alasan penolakan.");
      return;
    }

    try {
      setIsProcessing(true);
      if (action === "ACCEPT") {
        await dashboardService.acceptTransaction(selectedTrx.id);
        toast.success("Pembayaran diterima! Tiket telah diterbitkan.");
      } else {
        await dashboardService.rejectTransaction(selectedTrx.id, rejectReason);
        toast.success("Pembayaran ditolak. Transaksi dibatalkan.");
      }

      setIsModalOpen(false);
      setRejectReason("");
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal memproses verifikasi"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Kalkulasi Ringkasan
  const stats = {
    revenue: transactions
      .filter((t) => t.status === TransactionStatus.DONE)
      .reduce((sum, t) => sum + t.finalPrice, 0),
    ticketsSold: transactions
      .filter((t) => t.status === TransactionStatus.DONE)
      .reduce((sum, t) => sum + t.qty, 0),
    pending: transactions.filter(
      (t) => t.status === TransactionStatus.WAITING_CONFIRMATION
    ).length,
  };

  // Filter Logic
  const filteredData = transactions.filter((t) => {
    // Safety check: pastikan nilai string tidak null/undefined
    const userName = t.userName || "";
    const invoiceId = t.invoiceId || "";
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm) ||
      invoiceId.toLowerCase().includes(searchTerm);

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Report...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Event</h1>
          <p className="text-slate-500 text-sm">
            {event?.name || "Memuat nama event..."}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Pendapatan
            </CardTitle>
            <Banknote className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {formatRupiah(stats.revenue)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Hanya dari transaksi "Selesai"
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Tiket Terjual
            </CardTitle>
            <Ticket className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {stats.ticketsSold}
            </div>
            <p className="text-xs text-slate-400 mt-1">Tiket aktif</p>
          </CardContent>
        </Card>

        <Card
          className={`${
            stats.pending > 0 ? "border-orange-200 bg-orange-50/50" : ""
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Perlu Verifikasi
            </CardTitle>
            <AlertCircle
              className={`w-4 h-4 ${
                stats.pending > 0
                  ? "text-orange-600 animate-pulse"
                  : "text-slate-400"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {stats.pending}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Transaksi menunggu konfirmasi Anda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>Daftar Transaksi</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama / ID..."
                  className="pl-9 w-full sm:w-[250px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as TransactionStatus | "ALL")
                }
              >
                <option value="ALL">Semua Status</option>
                <option value={TransactionStatus.WAITING_CONFIRMATION}>
                  Perlu Verifikasi
                </option>
                <option value={TransactionStatus.DONE}>Selesai</option>
                <option value={TransactionStatus.WAITING_PAYMENT}>
                  Belum Bayar
                </option>
                <option value={TransactionStatus.REJECTED}>Ditolak</option>
                <option value={TransactionStatus.CANCELLED}>Dibatalkan</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID Transaksi</th>
                  <th className="px-4 py-3">Pembeli</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Total Harga</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredData.length > 0 ? (
                  filteredData.map((trx) => (
                    <tr
                      key={trx.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {trx.invoiceId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {trx.userName || "Unknown"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {trx.userEmail || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {trx.qty} Tiket
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {formatRupiah(trx.finalPrice)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={trx.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {trx.status ===
                        TransactionStatus.WAITING_CONFIRMATION ? (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={() => {
                              setSelectedTrx(trx);
                              setIsModalOpen(true);
                            }}
                          >
                            Verifikasi
                          </Button>
                        ) : (
                          <span className="text-slate-300 text-xs italic">
                            No Action
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Tidak ada transaksi yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Verifikasi */}
      {isModalOpen && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                Verifikasi Pembayaran
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">Bukti Transfer:</p>
                <div className="relative w-full h-64 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                  {selectedTrx.paymentProof ? (
                    <Image
                      src={selectedTrx.paymentProof}
                      alt="Bukti Transfer"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <AlertCircle className="mb-2" />
                      <p>Gambar tidak tersedia</p>
                    </div>
                  )}
                </div>
                {selectedTrx.paymentProof && (
                  <a
                    href={selectedTrx.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Lihat Ukuran Penuh
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-slate-50 p-4 rounded-lg">
                <div>
                  <span className="text-slate-500 block text-xs">
                    Total Tagihan
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatRupiah(selectedTrx.finalPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">
                    Waktu Upload
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedTrx.paymentProofUploadedAt
                      ? new Date(
                          selectedTrx.paymentProofUploadedAt
                        ).toLocaleString("id-ID")
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Catatan (Jika menolak)
                </label>
                <Input
                  placeholder="Contoh: Nominal tidak sesuai..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                onClick={() => handleVerify("REJECT")}
                disabled={isProcessing}
              >
                Tolak
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleVerify("ACCEPT")}
                disabled={isProcessing}
              >
                {isProcessing ? "Memproses..." : "Terima Pembayaran"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

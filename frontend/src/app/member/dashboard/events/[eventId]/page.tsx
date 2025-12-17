"use client";

import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  XCircle,
  Search,
  AlertCircle,
  Banknote,
  Ticket,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  dashboardService,
  TransactionItem,
  AttendeeItem,
} from "@/features/dashboard/services/dashboard.service";
import { eventService, Event } from "@/features/events/services/event.service";
import { TransactionStatus } from "@/@types";

import {
  TabNavigation,
  TabId,
  Tab,
} from "@/features/dashboard/components/TabNavigation";
import { formatRupiah } from "@/utils/formatters";
import { StatusBadge } from "@/components/ui/shared/statusBadge";
import { Pagination } from "@/components/ui/shared/pagination";
import { AttendeeList } from "@/features/dashboard/components/AttendeeList";
import useDebounce from "@/hooks/use-debounce";
import useUrlState from "@/hooks/useUrlState";

export default function EventReportPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { setLabel } = useBreadcrumb();
  // Panggil hook useUrlState
  const { getParam, getParamAsNumber, setParam, setParams } = useUrlState();

  const [event, setEvent] = useState<Event | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Init State dari URL
  const urlTab = getParam("tab", "transactions") as TabId;
  const urlSearch = getParam("search", "");
  const urlStatus = getParam("status", "ALL") as TransactionStatus | "ALL";
  const urlPage = getParamAsNumber("page", 1);

  const [activeTab, setActiveTab] = useState<TabId>(urlTab);

  const [attendees, setAttendees] = useState<AttendeeItem[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState<boolean>(false);

  // Filter state (Transactions)
  const [searchInput, setSearchInput] = useState<string>(urlSearch);
  const debouncedSearch = useDebounce<string>(searchInput, 500);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">(
    urlStatus
  );

  // Pagination state (Transactions)
  const [currentPage, setCurrentPage] = useState<number>(urlPage);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modal Verification State
  const [selectedTrx, setSelectedTrx] = useState<TransactionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] =
    useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --- Sync URL Effects ---

  // Sync Search ke URL (Hanya jika di tab transactions)
  useEffect(() => {
    if (
      activeTab === "transactions" &&
      debouncedSearch !== getParam("search")
    ) {
      setParams({ search: debouncedSearch, page: "1" });
      setCurrentPage(1);
    }
  }, [debouncedSearch, activeTab]);

  // Handle Back/Forward Browser Navigation
  useEffect(() => {
    setSearchInput(urlSearch);
    setStatusFilter(urlStatus);
    setCurrentPage(urlPage);
    setActiveTab(urlTab);
  }, [urlSearch, urlStatus, urlPage, urlTab]);

  // Handler Ganti Tab (Reset filter saat pindah tab)
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    // Reset semua param filter ketika pindah tab agar bersih
    setParams({
      tab: tab,
      search: "",
      status: "ALL",
      page: "1",
    });
    setSearchInput("");
  };

  // Handler Filter Status
  const handleStatusFilterChange = (status: TransactionStatus | "ALL") => {
    setStatusFilter(status);
    setParams({ status: status, page: "1" });
    setCurrentPage(1);
  };

  // Handler Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setParam("page", page.toString());
  };

  // --- Data Fetching ---
  const fetchData = async () => {
    if (!eventId) return;
    try {
      setLoading(true);

      const [eventsData, trxData] = await Promise.all([
        eventService.getOrganizerEvents(),
        dashboardService.getEventTransactions(eventId),
      ]);

      const currentEvent = eventsData.find((e) => e.id === eventId);
      if (currentEvent) {
        setEvent(currentEvent);
        setLabel(eventId, currentEvent.name);
      }

      setTransactions(Array.isArray(trxData) ? trxData : []);
    } catch (error) {
      console.error("Error loading report:", error);
      toast.error("Gagal memuat laporan event");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async () => {
    if (!eventId) return;

    try {
      setAttendeesLoading(true);
      const data = await dashboardService.getEventAttendees(eventId);

      const transformedData: any = data.map((item) => ({
        id: item.id,
        userName: item.userName,
        userEmail: item.userEmail,
        qty: item.qty,
        finalPrice: item.finalPrice,
        ticketTypeName: item.ticketType?.name || "Regular",
        createdAt: item.createdAt,
      }));

      setAttendees(transformedData);
    } catch (error) {
      console.error("Error loading attendees:", error);
      toast.error("Gagal memuat daftar peserta");
    } finally {
      setAttendeesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAttendees();
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
      setIsConfirmRejectOpen(false);
      setRejectReason("");
      fetchData();
      fetchAttendees();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal memproses verifikasi"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const openConfirmReject = () => {
    if (!rejectReason) {
      toast.warning("Mohon sertakan alasan penolakan terlebih dahulu.");
      return;
    }
    setIsConfirmRejectOpen(true);
  };

  const closeConfirmReject = () => {
    setIsConfirmRejectOpen(false);
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

  // Filter Logic (Transactions)
  const filteredData = transactions.filter((t) => {
    const userName = t.userName || "";
    const invoiceId = t.invoiceId || "";
    // Gunakan debouncedSearch dari state yang sudah tersinkron dengan URL
    const searchTerm = debouncedSearch.toLowerCase();

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm) ||
      invoiceId.toLowerCase().includes(searchTerm);

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Logic Pagination (Transactions)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const tabs: Tab[] = [
    {
      id: "transactions",
      label: "Transaksi",
      icon: <FileText className="w-4 h-4" />,
      count: transactions.length,
    },
    {
      id: "attendees",
      label: "Daftar Peserta",
      icon: <Users className="w-4 h-4" />,
      count: attendees.length,
    },
  ];

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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/member/events")}
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Event</h1>
          <p className="text-slate-500 text-sm">
            {event?.name || "Memuat nama event..."}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchData();
              fetchAttendees();
            }}
          >
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

      {/* Tab Navigation */}
      <Card className="overflow-hidden">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Tab Content - Conditional Rendering */}
        <div className="p-6">
          {activeTab === "transactions" ? (
            /* TAB TRANSACTIONS */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Cari nama / ID..."
                    className="pl-9"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>

                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) =>
                    handleStatusFilterChange(
                      e.target.value as TransactionStatus | "ALL"
                    )
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
                  <option value={TransactionStatus.CANCELLED}>
                    Dibatalkan
                  </option>
                  <option value={TransactionStatus.EXPIRED}>Kadaluarsa</option>
                </select>
              </div>

              {/* Transactions Table */}
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
                    {paginatedData.length > 0 ? (
                      paginatedData.map((trx) => (
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
                            {new Date(trx.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
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

              {/* Pagination */}
              {paginatedData.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredData.length}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={(items) => setItemsPerPage(items)}
                />
              )}
            </div>
          ) : (
            /* Tab Attendee */
            <AttendeeList
              key="attendees-tab"
              attendees={attendees}
              loading={attendeesLoading}
            />
          )}
        </div>
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
              {/* ... content modal ... */}
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">Bukti Transfer:</p>
                <div className="relative w-full h-64 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                  {selectedTrx.paymentProof ? (
                    <Image
                      src={selectedTrx.paymentProof}
                      alt="Bukti Transfer"
                      fill
                      className="object-contain"
                      unoptimized
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
                onClick={openConfirmReject}
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

            {isConfirmRejectOpen && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-md rounded-xl shadow-2xl">
                  {/* Header */}
                  <div className="px-6 py-4 border-b bg-red-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="font-bold text-lg">
                        Konfirmasi Penolakan
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-slate-600 mb-4">
                      Apakah Anda yakin ingin menolak pembayaran ini?
                    </p>

                    {/* Detail Transaksi */}
                    <div className="bg-slate-50 p-4 rounded-lg border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Invoice ID:</span>
                        <span className="font-mono font-medium">
                          {selectedTrx?.invoiceId}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Pembeli:</span>
                        <span className="font-medium">
                          {selectedTrx?.userName}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Total:</span>
                        <span className="font-semibold">
                          {formatRupiah(selectedTrx?.finalPrice)}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <span className="text-slate-500 text-sm">
                          Alasan penolakan:
                        </span>
                        <p className="text-sm font-medium mt-1 bg-white p-2 rounded border">
                          {rejectReason}
                        </p>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        <strong>Perhatian:</strong> Tindakan ini tidak dapat
                        dibatalkan.
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={closeConfirmReject}
                      disabled={isProcessing}
                    >
                      Batal
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleVerify("REJECT")}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Memproses..." : "Ya, Tolak Pembayaran"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

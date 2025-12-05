"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useDebounce from "@/hooks/use-debounce";

// --- Types ---
export interface AttendeeItem {
  id: string;
  userName: string;
  userEmail: string;
  qty: number;
  finalPrice: number;
  ticketTypeName?: string;
  createdAt: string;
}

interface AttendeeListProps {
  attendees: AttendeeItem[];
  loading: boolean;
}

// --- Helper Functions (Moved outside component) ---

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatDate = (dateString: string) => {
  // Validasi input agar tidak error invalid date
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const exportToCSV = (data: AttendeeItem[], eventName: string = "Event") => {
  const headers = [
    "No",
    "Nama Peserta",
    "Email",
    "Jenis Tiket",
    "Jumlah Tiket",
    "Total Bayar",
    "Tanggal Pembelian",
  ];

  const rows = data.map((item, index) => [
    index + 1,
    item.userName,
    item.userEmail,
    item.ticketTypeName || "-",
    item.qty,
    item.finalPrice,
    formatDate(item.createdAt),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Daftar_Peserta_${eventName.replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // FIX: Clean up memory
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

export function AttendeeList({ attendees, loading }: AttendeeListProps) {
  // State
  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearch = useDebounce<string>(searchInput, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter Logic
  const filteredAttendees = useMemo(() => {
    // Jika tidak ada search, kembalikan semua (optimization)
    if (!debouncedSearch) return attendees;

    const searchTerm = debouncedSearch.toLowerCase();
    return attendees.filter((attendee) => {
      const userName = attendee.userName?.toLowerCase() || "";
      const userEmail = attendee.userEmail?.toLowerCase() || "";
      // Opsional: Cari juga berdasarkan Tipe Tiket
      const ticketType = attendee.ticketTypeName?.toLowerCase() || "";

      return (
        userName.includes(searchTerm) ||
        userEmail.includes(searchTerm) ||
        ticketType.includes(searchTerm)
      );
    });
  }, [attendees, debouncedSearch]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);

  // FIX: Auto-correct page number if out of bounds (misal: habis filter atau data berubah)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAttendees = filteredAttendees.slice(startIndex, endIndex);

  // Stats Logic (Memoized untuk performa jika data besar)
  const stats = useMemo(() => {
    return {
      totalAttendees: filteredAttendees.length,
      totalTickets: filteredAttendees.reduce((sum, a) => sum + (a.qty || 0), 0),
      totalRevenue: filteredAttendees.reduce(
        (sum, a) => sum + (a.finalPrice || 0),
        0
      ),
    };
  }, [filteredAttendees]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (filteredAttendees.length === 0) {
      // Sebaiknya pakai Toast notification, tapi alert ok untuk sementara
      alert("Tidak ada data untuk di-export");
      return;
    }
    exportToCSV(filteredAttendees);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white rounded-lg border border-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-slate-500 animate-pulse">
            Memuat data peserta...
          </p>
        </div>
      </div>
    );
  }

  // Render Stats Cards
  const StatsCard = ({ title, value, sub, isCurrency = false }: any) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">
          {isCurrency ? formatRupiah(value) : value}
        </div>
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );

  if (attendees.length === 0 && !searchInput) {
    // Empty state UI (tetap sama seperti punyamu)
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed border-slate-300 bg-slate-50/50">
        <Users className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-lg font-medium text-slate-700 mb-1">
          Belum Ada Peserta
        </h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Peserta akan muncul di sini setelah ada transaksi tiket yang berhasil.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Peserta"
          value={stats.totalAttendees}
          sub="Peserta terdaftar (terfilter)"
        />
        <StatsCard
          title="Total Tiket"
          value={stats.totalTickets}
          sub="Tiket terjual"
        />
        <StatsCard
          title="Total Pendapatan"
          value={stats.totalRevenue}
          sub="Estimasi pendapatan"
          isCurrency
        />
      </div>

      {/* Attendee Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-600" />
              Daftar Peserta
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama, email, atau tiket..."
                  className="pl-9 w-full sm:w-[280px]"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Nama Peserta</th>
                  <th className="px-4 py-3 text-center">Jenis Tiket</th>
                  <th className="px-4 py-3 text-center">Jumlah</th>
                  <th className="px-4 py-3 text-right">Total Bayar</th>
                  <th className="px-4 py-3 text-center">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedAttendees.length > 0 ? (
                  paginatedAttendees.map((attendee, index) => (
                    <tr
                      key={attendee.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-4 py-3 text-center text-slate-500">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                          {attendee.userName || "Tanpa Nama"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {attendee.userEmail || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {attendee.ticketTypeName || "Regular"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700">
                        {attendee.qty}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatRupiah(attendee.finalPrice)}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">
                        {formatDate(attendee.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-slate-300" />
                        <p>
                          Tidak ditemukan peserta dengan kata kunci{" "}
                          <span className="font-medium text-slate-900">
                            "{searchInput}"
                          </span>
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredAttendees.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="hidden sm:inline">Tampilkan</span>
                <select
                  className="h-8 w-16 rounded-md border border-slate-300 bg-white px-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-slate-600 text-xs sm:text-sm">
                  {startIndex + 1}-
                  {Math.min(endIndex, filteredAttendees.length)} dari{" "}
                  {filteredAttendees.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-sm font-medium px-3 min-w-20 text-center">
                  {currentPage} / {totalPages || 1}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

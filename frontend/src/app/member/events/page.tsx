"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Link2,
  Ticket,
  Loader2,
  QrCode,
  ChevronLeft,
  ChevronRight,
  TicketPercent,
} from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

// Import Service dan Interface
import { eventService, Event } from "@/features/events/services/event.service";

type TabType = "ACTIVE" | "PAST";

export default function ManageEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("ACTIVE");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const EVENTS_PER_PAGE = 9; // Maksimal card per halaman

  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [selectedEventName, setSelectedEventName] = useState<string>("");

  // Fetch Events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getOrganizerEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Gagal memuat data event.");
      setEvents([]); // Fallback ke array kosong jika error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Reset ke halaman 1 setiap kali tab atau search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus event ini? Data yang dihapus tidak dapat dikembalikan."
      )
    )
      return;

    try {
      await eventService.deleteEvent(id);
      toast.success("Event berhasil dihapus");
      fetchEvents(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus event");
    }
  };

  const handleGenerateQR = async (slug: string, eventName: string) => {
    const publicUrl = `${window.location.origin}/event/${slug}`;
    try {
      const qrUrl = await QRCode.toDataURL(publicUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setQrDataUrl(qrUrl);
      setSelectedEventName(eventName);
      setQrModalOpen(true);
    } catch (err) {
      toast.error("Gagal generate QR Code");
    }
  };

  // Filter Logic (Safe)
  const eventList = Array.isArray(events) ? events : [];

  const filteredEvents = eventList.filter((event) => {
    const now = new Date();
    const endDate = new Date(event.endDate);

    // Filter by Tab (Active vs Past)
    const matchesTab = activeTab === "ACTIVE" ? endDate >= now : endDate < now;

    // Filter by Search
    const matchesSearch = event.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // pagination logic
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Helper Format Rupiah
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Event Saya</h1>
          <p className="text-slate-500 text-sm">
            Kelola semua event yang Anda buat di sini.
          </p>
        </div>
        <Link href="/create-event">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md">
            <Plus size={18} />
            Buat Event
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Cari Event Saya..."
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "ACTIVE"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            EVENT AKTIF
          </button>
          <button
            onClick={() => setActiveTab("PAST")}
            className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "PAST"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            EVENT LALU
          </button>
        </div>
      </div>

      {/* Event Grid (Menampilkan Data yang sudah dipaginasi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Create New Card (Hanya tampil di halaman 1 tab ACTIVE dan tidak sedang search) */}
        {activeTab === "ACTIVE" && !search && currentPage === 1 && (
          <Link href="/create-event" className="group h-full">
            <div className="h-full min-h-[380px] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-400 transition-all cursor-pointer gap-4">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-semibold text-slate-600 group-hover:text-blue-600">
                Buat Event Baru
              </p>
            </div>
          </Link>
        )}

        {/* Render Paginated Events */}
        {paginatedEvents.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200 flex flex-col"
          >
            {/* Image Section */}
            <div className="relative h-48 w-full bg-slate-200">
              <Image
                src={
                  event.imageUrl ||
                  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000"
                }
                alt={event.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-800 shadow-sm uppercase">
                  {event.category}
                </span>
              </div>
            </div>

            <CardHeader className="p-4 pb-2">
              <h3
                className="font-bold text-lg text-slate-900 line-clamp-1"
                title={event.name}
              >
                {event.name}
              </h3>
              <div className="flex flex-col gap-1 text-sm text-slate-500 mt-1">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue-500" />
                  <span className="line-clamp-1">
                    {event.city}, {event.venue}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex-1">
              <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-4 border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                    Tiket Terjual
                  </p>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                    <Ticket size={14} />
                    {event.totalTicketsSold}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                    Pendapatan
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    {formatRupiah(event.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex gap-2">
                {/* Quick Preview Button */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/event/${event.slug}`, "_blank")}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
                >
                  <Eye size={14} className="mr-1.5" />
                  Preview
                </Button> */}

                {/* Lihat Laporan */}
                <Link
                  href={`/member/dashboard/events/${event.id}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Lihat Laporan
                </Link>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} className="text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Lihat Halaman Detail Event Publik */}
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(`/event/${event.slug}`, "_blank")
                    }
                    className="group"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    <span className="flex-1">Lihat Halaman Publik</span>
                    {/* Status Badge */}
                    {new Date(event.endDate) >= new Date() ? (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                        ENDED
                      </span>
                    )}
                  </DropdownMenuItem>

                  {/* Copy Public Link */}
                  <DropdownMenuItem
                    onClick={async () => {
                      const publicUrl = `${window.location.origin}/event/${event.slug}`;
                      try {
                        await navigator.clipboard.writeText(publicUrl);
                        toast.success("Link berhasil dicopy!");
                      } catch (err) {
                        // Fallback for older browsers
                        const textArea = document.createElement("textarea");
                        textArea.value = publicUrl;
                        document.body.appendChild(textArea);
                        textArea.select();
                        // document.execCommand("copy");
                        document.body.removeChild(textArea);
                        toast.success("Link berhasil dicopy!");
                      }
                    }}
                  >
                    <Link2 className="mr-2 h-4 w-4" /> Copy Link Publik
                  </DropdownMenuItem>

                  {/* QR CODE */}
                  <DropdownMenuItem
                    onClick={() => handleGenerateQR(event.slug, event.name)}
                    className="cursor-pointer"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </DropdownMenuItem>

                  {/* Halaman Edit */}
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/member/events/edit/${event.id}`)
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Event
                  </DropdownMenuItem>

                  {/* Halaman Promotion */}
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/member/events/promotion/${event.id}`)
                    }
                  >
                    <TicketPercent className="mr-2 h-4 w-4" /> Edit Promotion
                  </DropdownMenuItem>

                  {/* Delete Event */}
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && search && (
        <div className="text-center py-20">
          <p className="text-slate-500">
            Tidak ada event yang cocok dengan pencarian "{search}".
          </p>
        </div>
      )}

      {filteredEvents.length === 0 && !search && activeTab === "PAST" && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-500">
            Belum ada riwayat event yang berlalu.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredEvents.length > EVENTS_PER_PAGE && (
        <div className="flex items-center justify-center gap-4 pt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-10 w-10 rounded-full"
          >
            <ChevronLeft size={20} />
          </Button>

          <span className="text-sm font-medium text-slate-600">
            Halaman {currentPage} dari {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="h-10 w-10 rounded-full"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <QrCode className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">QR Code Event</h3>
                  <p className="text-xs text-slate-500">{selectedEventName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQrModalOpen(false)}
              >
                ✕
              </Button>
            </div>

            {/* QR Code Display */}
            <div className="p-6">
              {qrDataUrl && (
                <div className="bg-slate-50 rounded-xl p-6 mb-4 flex justify-center">
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
                  </div>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📱 Scan QR code untuk akses halaman event
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement("a");
                  link.download = `qr-${selectedEventName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}.png`;
                  link.href = qrDataUrl;
                  link.click();
                  toast.success("QR Code downloaded!");
                }}
                className="flex-1"
              >
                Download
              </Button>
              <Button
                onClick={() => setQrModalOpen(false)}
                className="flex-1 bg-blue-600"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

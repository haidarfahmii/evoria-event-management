"use client";

import { useEffect, useState } from "react";
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
  Ticket,
  Loader2,
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
import axiosInstance from "@/utils/axiosInstance";
import { eventService, Event } from "@/features/events/services/event.service";

type TabType = "ACTIVE" | "PAST";

export default function ManageEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("ACTIVE");

  // Fetch Events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Menggunakan endpoint dashboard agar dapat statistik penjualan sekalian
      const data = await eventService.getOrganizerEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Gagal memuat data event.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus event ini? Data yang dihapus tidak dapat dikembalikan."
      )
    )
      return;

    try {
      await axiosInstance.delete(`/events/${id}`);
      toast.success("Event berhasil dihapus");
      fetchEvents(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus event");
    }
  };

  // Filter Logic
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
    <div className="space-y-6">
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

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Create New Card (Only visible on ACTIVE tab) */}
        {activeTab === "ACTIVE" && !search && (
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

        {/* Event Cards */}
        {filteredEvents.map((event) => (
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
              <Link
                href={`/member/dashboard/events/${event.id}`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Lihat Laporan
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} className="text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(`/event/${event.slug}`, "_blank")
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" /> Lihat Halaman Publik
                  </DropdownMenuItem>
                  {/* Note: Halaman edit belum dibuat, arahkan ke placeholder atau buat nanti */}
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/member/events/${event.id}/edit`)
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Event
                  </DropdownMenuItem>
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
    </div>
  );
}

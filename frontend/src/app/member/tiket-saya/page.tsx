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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

// ... copy component constants & helper functions ...
/**
 * ==========================================
 * 1. MOCK DATA & TYPES
 * ==========================================
 */

type TicketStatus = "active" | "completed" | "canceled" | "pending" | "expired";

interface TicketItem {
  id: string;
  bookingCode: string;
  title: string;
  image: string;
  date: string;
  time: string;
  venue: string;
  quantity: number;
  totalPrice: number;
  status: TicketStatus;
  attendeeName: string;
  seatInfo?: string; // Optional
}

// MOCK DATA (Sesuai referensi Anda)
const MY_TICKETS: TicketItem[] = [
  {
    id: "TRX-882910",
    bookingCode: "LOK-882910-JKT",
    title: "COLDPLAY: Music of the Spheres World Tour",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
    date: "15 Nov 2025",
    time: "19:00 WIB",
    venue: "Gelora Bung Karno Stadium",
    quantity: 2,
    totalPrice: 3500000,
    status: "active",
    attendeeName: "Hami Koshinah",
    seatInfo: "CAT 1 - Gate A - Row 12 - Seat 45, 46",
  },
  {
    id: "TRX-772102",
    bookingCode: "LOK-772102-SBY",
    title: "Workshop: Mastering React & Next.js",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
    date: "20 Oct 2025",
    time: "09:00 WIB",
    venue: "Grand City Convex, Surabaya",
    quantity: 1,
    totalPrice: 150000,
    status: "completed",
    attendeeName: "Hami Koshinah",
  },
  {
    id: "TRX-110293",
    bookingCode: "LOK-110293-BDG",
    title: "Stand Up Comedy: Tawa Nusantara",
    image:
      "https://images.unsplash.com/photo-1585699324551-f60882bac1e1?q=80&w=600&auto=format&fit=crop",
    date: "10 Sep 2025",
    time: "20:00 WIB",
    venue: "Sabuga ITB, Bandung",
    quantity: 2,
    totalPrice: 300000,
    status: "canceled",
    attendeeName: "Hami Koshinah",
  },
];

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

const Badge = ({ status }: { status: TicketStatus }) => {
  const styles = {
    active: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-gray-100 text-gray-600 border-gray-200",
    canceled: "bg-red-50 text-red-600 border-red-100",
    pending: "bg-orange-50 text-orange-600 border-orange-100",
    expired: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const labels = {
    active: "E-Voucher Ready",
    completed: "Selesai",
    canceled: "Dibatalkan",
    pending: "Menunggu Pembayaran",
    expired: "Kadaluarsa",
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

// --- 3.1 Modal Detail Tiket (Pop-up E-Voucher) ---
const TicketDetailModal = ({
  ticket,
  onClose,
}: {
  ticket: TicketItem;
  onClose: () => void;
}) => {
  if (!ticket) return null;

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
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="font-black text-xl text-[#00388D] flex items-center gap-1">
              <Ticket className="w-6 h-6 text-yellow-400" /> EVORIA
            </div>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <span className="text-sm font-semibold text-gray-500">
              E-Ticket
            </span>
          </div>

          {/* Event Title Big */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            {ticket.title}
          </h2>

          <div className="flex flex-col gap-6 mt-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Tanggal
                </p>
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <Calendar size={18} className="text-blue-600" /> {ticket.date}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Waktu
                </p>
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <Clock size={18} className="text-blue-600" /> {ticket.time}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Lokasi
                </p>
                <div className="flex items-start gap-2 text-gray-800 font-semibold">
                  <MapPin size={18} className="text-blue-600 mt-0.5 shrink-0" />{" "}
                  {ticket.venue}
                </div>
              </div>
            </div>

            {/* Order Details Box */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col gap-3">
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-xs text-gray-500">Booking Code</span>
                <span className="text-sm font-mono font-bold text-blue-800 tracking-wider">
                  {ticket.bookingCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Nama Pengunjung</span>
                <span className="text-sm font-semibold text-gray-800">
                  {ticket.attendeeName}
                </span>
              </div>
              {ticket.seatInfo && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Info Kursi</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {ticket.seatInfo}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Terms Link */}
          <div className="mt-auto pt-8">
            <button className="text-xs text-blue-600 underline hover:text-blue-800">
              Syarat & Ketentuan Berlaku
            </button>
          </div>

          {/* Perforation visual for Mobile (Bottom) */}
          <div className="md:hidden absolute -bottom-3 left-0 w-full h-6 flex justify-between px-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#F4F7FE]"></div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: QR Code & Actions */}
        <div className="w-full md:w-1/3 bg-gray-50 p-6 md:p-8 flex flex-col items-center justify-center border-l-0 md:border-l-2 border-dashed border-gray-300 relative">
          {/* Semicircle Cutouts for Desktop */}
          <div className="hidden md:block absolute -top-4 -left-4 w-8 h-8 bg-[#00388D] rounded-full z-10"></div>
          <div className="hidden md:block absolute -bottom-4 -left-4 w-8 h-8 bg-[#00388D] rounded-full z-10"></div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 w-full max-w-[200px]">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.bookingCode}`}
              alt="QR Code"
              className="w-full h-full opacity-90"
            />
          </div>

          <p className="text-center text-xs text-gray-500 mb-6">
            Tunjukkan QR Code ini kepada petugas di lokasi acara untuk discan.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button className="flex items-center justify-center gap-2 w-full bg-[#00388D] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-sm text-sm">
              <Download size={16} /> Download PDF
            </button>
            <button className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm">
              <Share2 size={16} /> Bagikan Tiket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3.2 Ticket Card Item ---
const TicketCard = ({
  ticket,
  onClick,
}: {
  ticket: TicketItem;
  onClick: () => void;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
    <div className="flex flex-col md:flex-row">
      {/* Thumbnail */}
      <div className="w-full md:w-48 h-32 md:h-auto shrink-0 relative bg-gray-200">
        <Image
          src={ticket.image}
          alt={ticket.title}
          fill
          className="object-cover w-full h-full"
        />
        {/* Mobile Status Badge */}
        <div className="absolute top-2 left-2 md:hidden">
          <Badge status={ticket.status} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="hidden md:block mb-2">
              <Badge status={ticket.status} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors mb-2">
              {ticket.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={14} /> {ticket.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} /> {ticket.time}
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} /> {ticket.venue}
              </div>
            </div>
          </div>

          {/* Price (Desktop) */}
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-xs text-gray-500">Total Harga</span>
            <span className="font-bold text-orange-600 text-lg">
              {formatRupiah(ticket.totalPrice)}
            </span>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText size={14} />
            Order ID:{" "}
            <span className="font-mono text-gray-700">{ticket.id}</span>
            <button
              className="text-blue-600 hover:text-blue-800 ml-1"
              title="Copy ID"
              onClick={() => navigator.clipboard.writeText(ticket.id)}
            >
              <Copy size={12} />
            </button>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Mobile Price */}
            <div className="md:hidden flex flex-col">
              <span className="text-[10px] text-gray-500">Total Harga</span>
              <span className="font-bold text-orange-600 text-base">
                {formatRupiah(ticket.totalPrice)}
              </span>
            </div>

            {ticket.status === "active" && (
              <Button
                onClick={onClick}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm ml-auto gap-2"
              >
                <QrCode size={16} /> Lihat E-Voucher
              </Button>
            )}
            {ticket.status === "completed" && (
              <Button
                variant="outline"
                className="text-gray-600 hover:bg-gray-100 ml-auto text-sm"
              >
                Beli Lagi
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function TiketSayaPage() {
  // ... copy semua state & logic ...
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "completed" | "canceled"
  >("active");

  // Filter Logic
  const filteredTickets =
    activeTab === "all"
      ? MY_TICKETS
      : MY_TICKETS.filter((t) => t.status === activeTab);

  return (
    // JANGAN gunakan <SidebarLayout> lagi, ganti div biasa atau Fragment
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tiket Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola tiket dan lihat riwayat transaksi Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium shadow-sm transition-all">
            <Filter size={16} /> Filter Tanggal
          </button>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: "active", label: "Aktif (1)" },
          { id: "completed", label: "Selesai" },
          { id: "canceled", label: "Dibatalkan" },
          { id: "all", label: "Semua Tiket" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#00388D] text-[#00388D]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="space-y-4 pb-20">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => setSelectedTicket(ticket)}
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
              Anda belum memiliki tiket di status ini.
            </p>
          </div>
        )}
      </div>
      {/* E-Ticket Modal Overlay */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

"use client"
import { MdOutlineDateRange, MdLocationOn } from "react-icons/md";
import { MdAdd, MdRemove, MdConfirmationNumber } from "react-icons/md";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface TicketType {
    id: string;
    name: string;
    price: number;
    seats: number;
}

interface EventData {
    id: string,
    name: string;
    slug: string,
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    city: string;
    venue: string;
    organizer: {
        name: string;
        email: string;
        avatarUrl: string;
    };
    imageUrl: string;
    ticketTypes: TicketType[]
}

interface Params {
    slug: string;
}

// Fetching Function
const getEventDetail = async (slug: string) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/events/detail/${slug}`
        );
        const event = await response.json();
        return event;
    } catch (error) {
        console.log(error)
        return null;
    }
}

export default function page({ params }: { params: Promise<Params> }) {
    // 1. Setup State Data & Loading
    const [event, setEvent] = useState<EventData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // 2. Setup State Interaction
    const [activeTab, setActiveTab] = useState<"about" | "terms">("about");
    const [selectedTicketId, setSelectedTicketId] = useState<string>(""); // Default kosong dulu
    const [quantity, setQuantity] = useState<number>(1);

    // 3. Fetch Data API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const { slug } = await params;
                const apiResult = await getEventDetail(slug);

                if (apiResult && apiResult.data) {
                    setEvent(apiResult.data);

                    // Set default selected ticket ke tipe pertama jika ada
                    if (apiResult.data.ticketTypes && apiResult.data.ticketTypes.length > 0) {
                        setSelectedTicketId(apiResult.data.ticketTypes[0].id);
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil data event", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // 4. Loading State & Null Check (PENTING: Agar tidak error saat render data yang belum ada)
    if (isLoading) {
        return (
            <main className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading Event...</p>
                </div>
            </main>
        );
    }

    if (!event) {
        return (
            <main className="bg-slate-50 min-h-screen flex items-center justify-center">
                <p className="text-red-500 font-bold text-lg">Event not found or failed to load.</p>
            </main>
        );
    }

    // 5. Derived State (Calculations)
    const selectedTicket = event.ticketTypes.find(t => t.id === selectedTicketId) || event.ticketTypes[0];

    // Safety check jika ticketTypes kosong
    if (!selectedTicket) return <div>No tickets available</div>;

    const totalPrice = selectedTicket.price * quantity;
    const isSoldOut = selectedTicket.seats === 0;

    // 6. Handlers
    const handleQuantityChange = (type: "increment" | "decrement") => {
        if (type === "increment" && quantity < selectedTicket.seats) {
            setQuantity(prev => prev + 1);
        } else if (type === "decrement" && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleTicketSelect = (id: string) => {
        setSelectedTicketId(id);
        setQuantity(1);
    };

    return (
        <main className="bg-slate-50">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10 p-5 py-30 items-start">
                <section>
                    <div className="relative bg-sky-100 h-[400px] mb-5 rounded-2xl overflow-hidden border-10 border-white shadow-md">
                        <div className="absolute z-10 text-white p-5">
                            <span className="bg-white p-2 rounded-xl text-black font-semibold text-xs tracking-wider opacity-80">
                                {event.category.toUpperCase()}
                            </span>
                        </div>
                        <Image
                            src={event.imageUrl}
                            fill
                            alt={event.name}
                            className="object-cover rounded-2xl z-0"
                            priority // Tambahkan priority untuk LCP yang lebih baik
                        />
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-md">
                        <div className="space-y-2 mb-5">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {event.name}
                            </h1>
                        </div>

                        <div className="grid grid-cols-2 mb-10">
                            <div className="flex flex-row gap-3">
                                <div className="bg-white inline-block p-2 rounded-xl h-fit">
                                    <MdOutlineDateRange size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm">Date</h3>
                                    {/* Format tanggal sederhana, bisa disesuaikan dengan library seperti date-fns */}
                                    <span className="font-semibold text-sm">
                                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-row gap-3">
                                <div className="bg-white inline-block p-2 rounded-xl h-fit">
                                    <MdLocationOn size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm">City & Venue</h3>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{event.city}</span>
                                        <span className="font-semibold text-gray-500 text-sm">{event.venue}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full mb-16">
                            {/* Tab About */}
                            <div className="flex gap-8 border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab("about")}
                                    className={`pb-4 text-sm font-semibold transition-all ${activeTab === "about"
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
                                        } -mb-0.5`}
                                >
                                    About Event
                                </button>

                                <button
                                    onClick={() => setActiveTab("terms")}
                                    className={`pb-4 text-sm font-semibold transition-all ${activeTab === "terms"
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
                                        } -mb-0.5`}
                                >
                                    Terms & Conditions
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="mt-6 text-gray-600 leading-relaxed text-base">
                                {activeTab === "about" ? (
                                    <p>
                                        {event.description}
                                    </p>
                                ) : (
                                    <div>
                                        <p className="mb-4 font-semibold">Here are the terms and conditions for the event:</p>
                                        {/* Static Terms - Jika terms ada di API, ganti dengan event.terms */}
                                        <ol className="list-decimal list-outside pl-5 space-y-2 text-sm">
                                            <li><strong>Ticket Validity:</strong> Tickets are valid only for the specific event...</li>
                                            <li><strong>Refund Policy:</strong> All ticket sales are final...</li>
                                            {/* ... (Isi terms lainnya sama seperti sebelumnya) ... */}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-100 flex flex-row justify-between px-4 py-2 items-center shadow-md rounded-3xl">
                            <div className="flex flex-row items-center gap-2">
                                <div className="h-[70px] w-[70px] relative">
                                    {/* Gunakan optional chaining atau placeholder jika avatar kosong */}
                                    <Image
                                        src={event.organizer.avatarUrl || "https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                                        alt="Avatar"
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="rounded-full object-cover" // rounded-4xl biasanya tidak standar di tailwind, rounded-full lebih aman
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm">Organized By</span>
                                    <span className="font-semibold">{event.organizer.name}</span>
                                </div>
                            </div>
                            <Link href={'#'}>
                                <span className="text-sm text-blue-600 hover:underline">View Organizer</span>
                            </Link>
                        </div>

                    </div>

                </section>

                <section className="bg-sky-100 sticky top-10 rounded-2xl overflow-hidden">
                    <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">

                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <MdConfirmationNumber className="text-blue-600" />
                                Select Ticket
                            </h3>
                        </div>

                        <div className="p-5 space-y-6">

                            {/* 1. Ticket Type Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Ticket Category
                                </label>
                                <div className="flex flex-col gap-3">
                                    {event.ticketTypes.map((ticket) => (
                                        <button
                                            key={ticket.id}
                                            onClick={() => handleTicketSelect(ticket.id)}
                                            disabled={ticket.seats === 0}
                                            className={`relative flex justify-between items-center p-4 rounded-xl border-2 text-left transition-all duration-200 group
                                ${selectedTicketId === ticket.id
                                                    ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600"
                                                    : "border-gray-100 hover:border-blue-300 bg-white"
                                                }
                                ${ticket.seats === 0 ? "opacity-50 cursor-not-allowed grayscale" : ""}
                                `}
                                        >
                                            <div>
                                                <span className={`font-bold block ${selectedTicketId === ticket.id ? "text-blue-700" : "text-gray-700"}`}>
                                                    {ticket.name}
                                                </span>
                                                {ticket.seats > 0 ? (
                                                    <span className={`text-xs ${ticket.seats < 20 ? "text-red-500 font-medium" : "text-gray-500"}`}>
                                                        {ticket.seats} seats available
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-red-500">SOLD OUT</span>
                                                )}
                                            </div>
                                            <div className="font-bold text-gray-900">
                                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(ticket.price)}
                                            </div>

                                            {/* Active Indicator Dot */}
                                            {selectedTicketId === ticket.id && (
                                                <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Quantity Selector */}
                            {!isSoldOut && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Quantity
                                        </label>
                                        {/* Validation Msg */}
                                        {quantity >= selectedTicket.seats && (
                                            <span className="text-[10px] text-red-500 font-medium">
                                                Max seats reached
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                                        <button
                                            onClick={() => handleQuantityChange("decrement")}
                                            disabled={quantity <= 1}
                                            className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            <MdRemove size={20} />
                                        </button>
                                        <span className="font-bold text-lg w-12 text-center text-gray-900">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange("increment")}
                                            disabled={quantity >= selectedTicket.seats}
                                            className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            <MdAdd size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <hr className="border-dashed border-gray-200" />

                            {/* 3. Total & Action */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-gray-500 mb-1">Total Payment</span>
                                    <div className="text-right">
                                        <span className="block text-2xl font-extrabold text-blue-600 leading-none">
                                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalPrice)}
                                        </span>
                                        <span className="text-[10px] text-gray-400">Includes taxes & fees</span>
                                    </div>
                                </div>

                                <button
                                    disabled={isSoldOut}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-[0.98]"
                                >
                                    {isSoldOut ? "Tickets Sold Out" : "Book Tickets Now"}
                                </button>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </main>
    )
}
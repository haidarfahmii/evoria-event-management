// components/event/TicketingSection.tsx
"use client"
import { MdAdd, MdRemove, MdConfirmationNumber } from "react-icons/md";
import { useState } from "react";

interface TicketType {
    id: string;
    name: string;
    price: number;
    seats: number;
}

interface TicketingSectionProps {
    ticketTypes: TicketType[];
    eventId: string;
}

export default function TicketingSection({ ticketTypes, eventId }: TicketingSectionProps) {
    // State for ticket selection
    const [selectedTicketId, setSelectedTicketId] = useState<string>(
        ticketTypes && ticketTypes.length > 0 ? ticketTypes[0].id : ""
    );
    const [quantity, setQuantity] = useState<number>(1);

    // Derived state
    const selectedTicket = ticketTypes.find(t => t.id === selectedTicketId) || ticketTypes[0];

    // Safety check
    if (!selectedTicket) return <div>No tickets available</div>;

    const totalPrice = selectedTicket.price * quantity;
    const isSoldOut = selectedTicket.seats === 0;

    // Handlers
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

    // --- TAMBAHAN: Fungsi untuk Console Log ---
    const handleCheckout = () => {
        const result = {
            eventId: eventId,
            ticketId: selectedTicket.id,
            ticketName: selectedTicket.name,
            pricePerUnit: selectedTicket.price,
            quantity: quantity,
            totalPrice: totalPrice,
        };

        console.log("=== CHECKOUT DATA ===");
        console.log(result);
    };

    return (
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
                            {ticketTypes.map((ticket) => (
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
                                        {ticket.price === 0
                                            ? "FREE"
                                            : new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                maximumFractionDigits: 0
                                            }).format(ticket.price)
                                        }
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
                                {quantity >= 3 ? (
                                    <span className="text-[10px] text-red-500 font-medium">
                                        Max 3 tickets per user
                                    </span>
                                ) : quantity >= selectedTicket.seats ? (
                                    <span className="text-[10px] text-red-500 font-medium">
                                        Max seats reached
                                    </span>
                                ) : null}
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
                                    disabled={quantity >= selectedTicket.seats || quantity >= 3}
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
                                    {totalPrice === 0
                                        ? "FREE"
                                        : new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            maximumFractionDigits: 0
                                        }).format(totalPrice)
                                    }
                                </span>
                                <span className="text-[10px] text-gray-400">Includes taxes & fees</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout} // <--- PERUBAHAN DISINI (Attach Handler)
                            disabled={isSoldOut}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-[0.98]"
                        >
                            {isSoldOut ? "Tickets Sold Out" : "Book Tickets Now"}
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}
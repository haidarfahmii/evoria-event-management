"use client";
import { MdAdd, MdRemove, MdConfirmationNumber } from "react-icons/md";
import { useState, useEffect } from "react";
import CouponWidget, { CouponData } from "./CouponWidget";
import PromotionWidget from "./PromotionWidget";
import PointWidget from "./PointWidget";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { ImSpinner8 } from "react-icons/im";

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

interface CheckoutPayload {
    eventId: string;
    ticketTypeId: string;
    qty: number;
    pointsUsed?: number;
    totalPrice: number;
    couponId?: string; // Tanda tanya (?) berarti boleh ada, boleh tidak
    promotionId?: string;
}

export default function TicketingSection({ ticketTypes, eventId }: TicketingSectionProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for ticket selection
    const [selectedTicketId, setSelectedTicketId] = useState<string>(
        ticketTypes && ticketTypes.length > 0 ? ticketTypes[0].id : ""
    );
    const [quantity, setQuantity] = useState<number>(1);

    // State for Coupon
    const [discount, setDiscount] = useState<number>(0);
    const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>("");
    const [appliedCouponId, setAppliedCouponId] = useState<string>("");

    // State for Promotion
    const [promoDiscount, setPromoDiscount] = useState<number>(0);
    const [appliedPromoId, setAppliedPromoId] = useState<string | null>("");
    const [appliedPromoCode, setAppliedPromoCode] = useState<string>("");

    // State for point
    const [pointUsed, setPointUsed] = useState<number>(0);

    // Derived state
    const selectedTicket = ticketTypes.find((t) => t.id === selectedTicketId) || ticketTypes[0];

    // Safety check
    if (!selectedTicket) return <div>No tickets available</div>;

    const subTotal = selectedTicket.price * quantity;
    // Pastikan total tidak minus
    const totalPrice = Math.max(0, subTotal - discount - promoDiscount - pointUsed);
    const isSoldOut = selectedTicket.seats === 0;

    // Handlers
    const handleQuantityChange = (type: "increment" | "decrement") => {
        if (type === "increment" && quantity < selectedTicket.seats) {
            setQuantity((prev) => prev + 1);
        } else if (type === "decrement" && quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleTicketSelect = (id: string) => {
        setSelectedTicketId(id);
        setQuantity(1);
        // Optional: Reset coupon when ticket type changes if rules apply
        handleRemoveCoupon();
        handleRemovePromotion();
    };

    // --- NEW: Coupon Handlers ---
    const handleApplyCoupon = (data: { couponId: string; couponCode: string; discountAmount: number }) => {

        // 1. Set Discount dengan NOMINAL (Rupiah), bukan percentage lagi
        // Karena Widget sudah menghitungnya menjadi rupiah di 'discountAmount'
        setDiscount(data.discountAmount);

        // 2. Set Code untuk display
        setAppliedCouponCode(data.couponCode);

        // 3. Set ID untuk dikirim ke backend nanti
        setAppliedCouponId(data.couponId);
    };

    const handleRemoveCoupon = () => {
        setDiscount(0);
        setAppliedCouponCode(null);
    };

    // Promotion Handler
    const handleApplyPromotion = (result: { promotionId: string; discountAmount: number; promotionCode: string }) => {
        // Logic: Biasanya Promo dan Kupon tidak bisa digabung (opsional)
        // Jika tidak boleh digabung, reset kupon saat promo dipakai
        // handleRemoveCoupon(); 

        setPromoDiscount(result.discountAmount);
        setAppliedPromoId(result.promotionId);
        setAppliedPromoCode(result.promotionCode)
    };

    const handleRemovePromotion = () => {
        setPromoDiscount(0);
        setAppliedPromoId(null);
    };

    // Handle Point
    const handleApplyPoints = (amount: number) => {
        setPointUsed(amount);
    };

    const handleCheckout = async () => {
        // Prevent double submit
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Persiapan Payload
            const payload: CheckoutPayload = {
                eventId: eventId,
                ticketTypeId: selectedTicket.id,
                qty: quantity,
                pointsUsed: pointUsed || 0, // Backend biasanya prefer number (0) daripada null untuk kalkulasi
                totalPrice: totalPrice // Opsional: Terkadang backend butuh ini untuk validasi selisih
            };

            // Hanya masukkan key couponId ke dalam payload JIKA ada isinya (bukan string kosong)
            if (appliedCouponId) {
                payload.couponId = appliedCouponId;
            }

            // Sama juga untuk promotionId
            if (appliedPromoId) {
                payload.promotionId = appliedPromoId;
            }

            // console.log("Sending payload:", payload);

            // // 1. POST ke API
            const response = await axiosInstance.post(`/transactions`, payload);

            alert('Successfully Buy Ticket')
        } catch (error: any) {
            console.error("Checkout Failed:", error);

            // Tampilkan error (Bisa ganti pakai Toast / Alert)
            const errorMsg = error.response?.data?.message || "Terjadi kesalahan saat checkout.";
            alert(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
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
                                        <span
                                            className={`font-bold block ${selectedTicketId === ticket.id ? "text-blue-700" : "text-gray-700"
                                                }`}
                                        >
                                            {ticket.name}
                                        </span>
                                        {ticket.seats > 0 ? (
                                            <span
                                                className={`text-xs ${ticket.seats < 20 ? "text-red-500 font-medium" : "text-gray-500"
                                                    }`}
                                            >
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
                                                maximumFractionDigits: 0,
                                            }).format(ticket.price)}
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
                                    <span className="text-[10px] text-red-500 font-medium">Max seats reached</span>
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

                    {/* --- NEW: 3. Coupon & Promo Widget Section --- */}

                    {selectedTicket.price > 0 && !isSoldOut && (
                        <>
                            <CouponWidget
                                key={`coupon-${selectedTicketId}`}

                                originalPrice={subTotal}
                                onApplyCoupon={handleApplyCoupon}
                                onRemoveCoupon={handleRemoveCoupon}
                            />
                            <hr className="border-dashed border-gray-200" />
                            <PromotionWidget
                                key={`promo-${selectedTicketId}`}

                                eventId={eventId}
                                originalPrice={subTotal}
                                onApplyPromotion={handleApplyPromotion}
                                onRemovePromotion={handleRemovePromotion}
                            />
                            <PointWidget
                                originalPrice={subTotal - discount - promoDiscount} // Pass sisa tagihan agar tidak minus
                                onApplyPoints={handleApplyPoints}
                            />
                        </>
                    )}




                    {/* 4. Total & Action */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            {/* Menampilkan Subtotal jika ada diskon */}
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(subTotal)}</span>
                                </div>
                            )}

                            {/* Menampilkan Nominal Diskon */}
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Discount ({appliedCouponCode})</span>
                                    <span>- {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(discount)}</span>
                                </div>
                            )}
                            {promoDiscount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Discount ({appliedPromoCode})</span>
                                    <span>- {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(promoDiscount)}</span>
                                </div>
                            )}
                            {pointUsed > 0 && (
                                <div className="flex justify-between text-sm text-amber-600 font-medium">
                                    <span>Points Redeemed</span>
                                    <span>- {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pointUsed)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-end pt-2">
                                <span className="text-sm text-gray-500 mb-1">Total Payment</span>
                                <div className="text-right">
                                    <span className="block text-2xl font-extrabold text-blue-600 leading-none">
                                        {totalPrice === 0 && discount === 0 && selectedTicket.price === 0
                                            ? "FREE"
                                            : new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                maximumFractionDigits: 0,
                                            }).format(totalPrice)}
                                    </span>
                                    <span className="text-[10px] text-gray-400">Includes taxes & fees</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            // Disable tombol jika Sold Out ATAU sedang Loading Submit
                            disabled={isSoldOut || isSubmitting}
                            className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] 
                ${isSoldOut || isSubmitting
                                    ? "bg-gray-300 cursor-not-allowed shadow-none text-gray-500"
                                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-[0.98] text-white"
                                } flex justify-center items-center gap-2`}
                        >
                            {isSubmitting ? (
                                <>
                                    <ImSpinner8 className="animate-spin text-xl" />
                                    Processing...
                                </>
                            ) : isSoldOut ? (
                                "Tickets Sold Out"
                            ) : (
                                "Book Tickets Now"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
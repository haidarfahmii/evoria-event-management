"use client";
import { MdAdd, MdRemove, MdConfirmationNumber } from "react-icons/md";
import { ImSpinner8 } from "react-icons/im";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CouponWidget, { CouponResult } from "./CouponWidget";
import PromotionWidget, { PromotionResult } from "./PromotionWidget";
import PointWidget from "./PointWidget";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { formatRupiah } from "@/utils/formatters";
import LoginRequiredModal from "./LoginRequiredModal";

interface TicketType {
  id: string;
  name: string;
  price: number;
  seats: number;
}

interface TicketingSectionProps {
  ticketTypes: TicketType[];
  eventId: string;
  organizerId: string;
}

interface CheckoutPayload {
  eventId: string;
  ticketTypeId: string;
  qty: number;
  pointsUsed?: number;
  totalPrice: number;
  couponId?: string;
  promotionId?: string;
}

export default function TicketingSection({
  ticketTypes,
  eventId,
  organizerId,
}: TicketingSectionProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
  const [appliedPromotion, setAppliedPromotion] =
    useState<PromotionResult | null>(null);

  // State for Point
  const [pointUsed, setPointUsed] = useState<number>(0);

  // State keys to force reset child widgets on ticket change
  const [couponKey, setCouponKey] = useState(0);
  const [promoKey, setPromoKey] = useState(0);
  const [pointKey, setPointKey] = useState(0);

  // Derived state
  const selectedTicket =
    ticketTypes.find((t) => t.id === selectedTicketId) || ticketTypes[0];

  // Safety check
  if (!selectedTicket) return <div>No tickets available</div>;

  const basePrice = selectedTicket.price * quantity;
  let currentPrice = basePrice;

  // Calculate Current Price
  if (appliedPromotion) {
    currentPrice -= appliedPromotion.discountAmount;
  }
  if (discount > 0) {
    currentPrice -= discount;
  }
  if (pointUsed > 0) {
    currentPrice -= pointUsed;
  }

  const totalPrice = Math.max(0, currentPrice);
  const isSoldOut = selectedTicket.seats === 0;

  // --- Logic to check which method is active ---
  const isCouponActive = discount > 0;
  const isPromoActive = !!appliedPromotion;
  const isPointActive = pointUsed > 0;

  // Auto-remove promotion saat qty berubah
  useEffect(() => {
    if (appliedPromotion) {
      console.log("🔄 Qty changed in parent, removing promotion");
      handleRemovePromotion();
    }
  }, [quantity]);

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

    // Reset all methods when ticket type changes
    handleRemoveCoupon();
    handleRemovePromotion();
    setPointUsed(0);

    // Force reset UI for all widgets
    setCouponKey((prev) => prev + 1);
    setPromoKey((prev) => prev + 1);
    setPointKey((prev) => prev + 1);
  };

  // --- Coupon Handlers ---
  const handleApplyCoupon = (data: CouponResult) => {
    console.log("✅ Coupon applied:", data);
    setDiscount(data.discountAmount);
    setAppliedCouponCode(data.couponCode);
    setAppliedCouponId(data.couponId);
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCouponCode(null);
    setAppliedCouponId("");
  };

  // --- Promotion Handlers ---
  const handleApplyPromotion = (result: PromotionResult) => {
    console.log("✅ Promotion applied:", result);
    setAppliedPromotion(result);
  };

  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
  };

  // --- Point Handlers ---
  const handleApplyPoints = (amount: number) => {
    setPointUsed(amount);
  };

  const isOwner = session?.user?.id === organizerId;

  const handleCheckout = async () => {
    if (status === "unauthenticated" || !session) {
      setShowLoginModal(true);
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload: CheckoutPayload = {
        eventId: eventId,
        ticketTypeId: selectedTicket.id,
        qty: quantity,
        pointsUsed: pointUsed || 0,
        totalPrice: totalPrice,
      };

      if (appliedCouponId) {
        payload.couponId = appliedCouponId;
      }
      if (appliedPromotion?.promotionId) {
        payload.promotionId = appliedPromotion.promotionId;
      }

      await axiosInstance.post(`/transactions`, payload);
      toast.success("Successfully Buy Ticket");
      router.push("/member/tiket-saya");
    } catch (error: any) {
      console.error("Checkout Failed:", error);
      const errorMsg =
        error.response?.data?.message || "Terjadi kesalahan saat checkout.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        callbackUrl={
          typeof window !== "undefined" ? window.location.href : undefined
        }
      />

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
            {/* Ticket Type Selection */}
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
                                ${ticket.seats === 0
                        ? "opacity-50 cursor-not-allowed grayscale"
                        : ""
                      }
                                `}
                  >
                    <div>
                      <span
                        className={`font-bold block ${selectedTicketId === ticket.id
                          ? "text-blue-700"
                          : "text-gray-700"
                          }`}
                      >
                        {ticket.name}
                      </span>
                      {ticket.seats > 0 ? (
                        <span
                          className={`text-xs ${ticket.seats < 20
                            ? "text-red-500 font-medium"
                            : "text-gray-500"
                            }`}
                        >
                          {ticket.seats} seats available
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-500">
                          SOLD OUT
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-gray-900">
                      {ticket.price === 0 ? "FREE" : formatRupiah(ticket.price)}
                    </div>

                    {selectedTicketId === ticket.id && (
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            {!isSoldOut && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Quantity
                  </label>
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
                  <span className="font-bold text-lg w-12 text-center text-gray-900">
                    {quantity}
                  </span>
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

            {/* Coupon & Promo Widget Section */}
            {selectedTicket.price > 0 && !isSoldOut && (
              <>
                {session ? (
                  <>
                    {/* Coupon Widget Wrapper */}
                    <div
                      className={`transition-all duration-300 ${isPromoActive || isPointActive
                        ? "opacity-40 pointer-events-none grayscale blur-[0.5px]"
                        : ""
                        }`}
                    >
                      <CouponWidget
                        key={`coupon-${selectedTicketId}-${couponKey}`}
                        originalPrice={selectedTicket.price}
                        qty={quantity}
                        onApplyCoupon={handleApplyCoupon}
                        onRemoveCoupon={handleRemoveCoupon}
                      />
                    </div>

                    <hr className="border-dashed border-gray-200" />

                    {/* Promotion Widget Wrapper */}
                    <div
                      className={`transition-all duration-300 ${isCouponActive || isPointActive
                        ? "opacity-40 pointer-events-none grayscale blur-[0.5px]"
                        : ""
                        }`}
                    >
                      <PromotionWidget
                        key={`promo-${selectedTicketId}-${quantity}-${promoKey}`}
                        eventId={eventId}
                        originalPrice={selectedTicket.price}
                        qty={quantity}
                        onApplyPromotion={handleApplyPromotion}
                        onRemovePromotion={handleRemovePromotion}
                      />
                    </div>

                    <hr className="border-dashed border-gray-200" />

                    {/* Point Widget Wrapper */}
                    <div
                      className={`transition-all duration-300 ${isCouponActive || isPromoActive
                        ? "opacity-40 pointer-events-none grayscale blur-[0.5px]"
                        : ""
                        }`}
                    >
                      <PointWidget
                        key={`point-${selectedTicketId}-${pointKey}`}
                        originalPrice={Math.max(0, currentPrice)}
                        onApplyPoints={handleApplyPoints}
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      Punya poin atau kode promo?
                    </p>
                    <button
                      onClick={() => router.push("/login")}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      Login untuk gunakan diskon
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Price Summary & Checkout */}
            <div className="space-y-4">
              <div className="space-y-2">
                {(discount > 0 || appliedPromotion || pointUsed > 0) && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({quantity}x tiket)</span>
                    <span>{formatRupiah(basePrice)}</span>
                  </div>
                )}

                {/* Promotion Discount */}
                {appliedPromotion && (
                  <div className="flex justify-between text-sm text-purple-600 font-medium">
                    <span>
                      Promo Discount ({appliedPromotion.promotionCode})
                    </span>
                    <span>
                      - {formatRupiah(appliedPromotion.discountAmount)}
                    </span>
                  </div>
                )}

                {/* Coupon Discount */}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount Coupon ({appliedCouponCode})</span>
                    <span>- {formatRupiah(discount)}</span>
                  </div>
                )}

                {/* Points Redeemed */}
                {pointUsed > 0 && (
                  <div className="flex justify-between text-sm text-amber-600 font-medium">
                    <span>Points Used</span>
                    <span>- {formatRupiah(pointUsed)}</span>
                  </div>
                )}

                {/* Total Payment */}
                <div className="flex justify-between items-end pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600 font-semibold">
                    Total Payment
                  </span>
                  <div className="text-right">
                    <span className="block text-2xl font-extrabold text-blue-600 leading-none">
                      {totalPrice === 0 && selectedTicket.price === 0
                        ? "FREE"
                        : formatRupiah(totalPrice)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Includes taxes & fees
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isSoldOut || isSubmitting || isOwner}
                className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] 
                ${isSoldOut || isSubmitting || isOwner
                    ? "bg-gray-300 cursor-not-allowed shadow-none text-gray-500"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-[0.98] text-white"
                  } flex justify-center items-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <ImSpinner8 className="animate-spin text-xl" />
                    Processing...
                  </>
                ) : isOwner ? (
                  "You are the organizer"
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
    </>
  );
}
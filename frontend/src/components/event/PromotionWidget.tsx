"use client";

import { useState, useEffect } from "react";
import { MdDiscount, MdCheckCircle, MdCancel, MdClose } from "react-icons/md";
import { ImSpinner8 } from "react-icons/im";
import axiosInstance from "@/utils/axiosInstance";

// Interface Data MENTAH dari API (Sesuai screenshot)
export interface PromotionData {
  id: string;
  eventId: string;
  code: string; // e.g. "SLOW123"
  type: "PERCENTAGE" | "FLAT";
  value: number; // e.g. 25
  startDate: string; // e.g. "2025-12-11..."
  endDate: string; // e.g. "2027-12-12..."
  maxUsage: number | null;
}

// Interface Data BERSIH untuk Parent
export interface PromotionResult {
  promotionId: string;
  promotionCode: string;
  discountAmount: number;
}

interface PromotionWidgetProps {
  eventId: string;
  onApplyPromotion: (promo: PromotionResult) => void;
  onRemovePromotion: () => void;
  originalPrice: number;
  qty: number; // Qty untuk recalculate diskon saat berubah
}

export default function PromotionWidget({
  eventId,
  onApplyPromotion,
  onRemovePromotion,
  originalPrice,
  qty,
}: PromotionWidgetProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [appliedPromo, setAppliedPromo] = useState<PromotionData | null>(null);

  // PENTING: Auto-remove promotion saat qty berubah
  // Ini mencegah bug: diskon tetap sama saat qty diubah
  useEffect(() => {
    if (appliedPromo) {
      console.log("🔄 Qty changed, removing promotion. User must re-apply.");
      handleRemove();
    }
  }, [qty]); // Dependency: qty

  const handleApply = async () => {
    if (!code) return;
    if (!eventId) {
      setError("Event ID tidak ditemukan");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // hitung total price berdasarkan qty saat ini
      const totalPrice = originalPrice * qty;

      // Fetch Promosi berdasarkan EVENT ID
      const response = await axiosInstance.get(
        `/transactions/promotion/event/${eventId}`
      );

      const promotions: PromotionData[] = Array.isArray(
        response.data?.data.promotion
      )
        ? response.data.data.promotion
        : [];

      // Normalisasi input user (Huruf Besar agar cocok dengan "SLOW123")
      const inputCode = code.toUpperCase();

      // Cari promosi yang cocok di dalam Array
      const foundPromo = promotions.find(
        (p) => p.code.toUpperCase() === inputCode
      );

      // Validasi: Jika kode tidak ditemukan di list event tersebut
      if (!foundPromo) {
        throw new Error("Kode promosi tidak valid untuk event ini");
      }

      // Validasi: Cek Tanggal Berlaku (Start & End Date)
      const now = new Date();
      const startDate = new Date(foundPromo.startDate);
      const endDate = new Date(foundPromo.endDate);

      if (now < startDate) {
        throw new Error(
          `Promosi baru bisa dipakai mulai ${startDate.toLocaleDateString(
            "id-ID"
          )}`
        );
      }
      if (now > endDate) {
        throw new Error("Masa berlaku promosi sudah habis");
      }

      // Validasi kuota
      if (foundPromo.maxUsage !== null && foundPromo.maxUsage <= 0) {
        throw new Error("Kuota promosi sudah habis");
      }

      // Hitung Nominal Diskon
      let calculatedDiscount = 0;

      if (foundPromo.type === "PERCENTAGE") {
        calculatedDiscount = Math.floor((totalPrice * foundPromo.value) / 100);
      } else {
        // Fixed Amount (Potongan Harga Langsung)
        calculatedDiscount = foundPromo.value;
      }

      // Cap diskon agar tidak melebihi harga tiket
      if (calculatedDiscount > originalPrice) {
        calculatedDiscount = originalPrice;
      }

      // Siapkan data output
      const resultToParent: PromotionResult = {
        promotionId: foundPromo.id,
        promotionCode: foundPromo.code,
        discountAmount: calculatedDiscount,
      };

      // untuk debugging
      console.log("✅ Promotion Valid:", resultToParent);
      console.log(`   Qty: ${qty}`);
      console.log(`   Price per ticket: Rp ${originalPrice.toLocaleString()}`);
      console.log(`   Total Price: Rp ${totalPrice.toLocaleString()}`);
      console.log(
        `   Discount (${foundPromo.value}${
          foundPromo.type === "PERCENTAGE" ? "%" : ""
        }): Rp ${calculatedDiscount.toLocaleString()}`
      );
      console.log(
        `   Final Price: Rp ${(
          totalPrice - calculatedDiscount
        ).toLocaleString()}`
      );

      // Update State & Parent
      setAppliedPromo(foundPromo);
      onApplyPromotion(resultToParent);
    } catch (err: any) {
      console.error("Promotion Error:", err);
      const msg =
        err.response?.data?.message || err.message || "Gagal memproses promosi";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedPromo(null);
    setCode("");
    setError("");
    onRemovePromotion();
  };

  // --- UI Render ---
  if (appliedPromo) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MdCheckCircle className="text-purple-600 text-xl" />
          <div>
            <p className="text-xs text-purple-800 font-bold">
              Promosi Event Dipakai
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-purple-700">
                {appliedPromo.code}
              </p>
              <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full font-bold">
                {/* Tampilkan label sesuai tipe */}
                {appliedPromo.type === "PERCENTAGE"
                  ? `${appliedPromo.value}% OFF`
                  : `- ${new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(appliedPromo.value)}`}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
        >
          <MdClose size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-500 tracking-wide flex items-center gap-1">
        <MdDiscount className="text-purple-600" /> Event Promo Code?
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="e.g PROMO101"
          className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 outline-none transition-all uppercase"
          disabled={isLoading}
        />
        <button
          onClick={handleApply}
          disabled={!code || isLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors flex items-center"
        >
          {isLoading ? <ImSpinner8 className="animate-spin" /> : "Use"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1 text-red-500 text-xs font-medium animate-in slide-in-from-top-1">
          <MdCancel /> {error}
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-1">
        💡 Satu akun hanya bisa membeli tiket 1x per event
      </p>
    </div>
  );
}

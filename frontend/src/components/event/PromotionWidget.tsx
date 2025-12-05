"use client";

import { useState } from "react";
import { MdDiscount, MdCheckCircle, MdCancel, MdClose } from "react-icons/md";
import { ImSpinner8 } from "react-icons/im";
import axiosInstance from "@/utils/axiosInstance";

// 1. Interface Data MENTAH dari API (Sesuai screenshot)
export interface PromotionData {
    id: string;
    eventId: string;
    code: string;           // e.g. "SLOW123"
    type: "PERCENTAGE" | "FLAT";
    value: number;          // e.g. 25
    startDate: string;      // e.g. "2025-12-11..."
    endDate: string;        // e.g. "2027-12-12..."
    maxUsage: number;
}

// 2. Interface Data BERSIH untuk Parent
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
}

export default function PromotionWidget({
    eventId,
    onApplyPromotion,
    onRemovePromotion,
    originalPrice,
}: PromotionWidgetProps) {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [appliedPromo, setAppliedPromo] = useState<PromotionData | null>(null);

    const handleApply = async () => {
        if (!code) return;
        if (!eventId) {
            setError("Event ID tidak ditemukan");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // 1. Fetch Promosi berdasarkan EVENT ID
            // Pastikan URL endpoint sesuai dengan backend kamu
            const response = await axiosInstance.get(`/transactions/promotion/event/${eventId}`);

            const promotions: PromotionData[] = Array.isArray(response.data?.data.promotion)
                ? response.data.data.promotion
                : [];

            // 2. Normalisasi input user (Huruf Besar agar cocok dengan "SLOW123")
            const inputCode = code.toUpperCase();

            // 3. Cari promosi yang cocok di dalam Array
            const foundPromo = promotions.find((p) => p.code.toUpperCase() === inputCode);

            // 4. Validasi: Jika kode tidak ditemukan di list event tersebut
            if (!foundPromo) {
                throw new Error("Kode promosi tidak valid untuk event ini");
            }

            if (foundPromo.maxUsage <= 0) {
                throw new Error("Kode promosi habis terpakai")
            }

            // 5. Validasi: Cek Tanggal Berlaku (Start & End Date)
            const now = new Date();
            const startDate = new Date(foundPromo.startDate);
            const endDate = new Date(foundPromo.endDate);

            if (now < startDate) {
                throw new Error(`Promosi baru bisa dipakai mulai ${startDate.toLocaleDateString('id-ID')}`);
            }
            if (now > endDate) {
                throw new Error("Masa berlaku promosi sudah habis");
            }

            // 6. Hitung Nominal Diskon
            let calculatedDiscount = 0;

            if (foundPromo.type === "PERCENTAGE") {
                // Rumus: (Harga * Value) / 100. Contoh: (100.000 * 25) / 100 = 25.000
                calculatedDiscount = (originalPrice * foundPromo.value) / 100;
            } else {
                // Fixed Amount (Potongan Harga Langsung)
                calculatedDiscount = foundPromo.value;
            }

            // Cap diskon agar tidak melebihi harga tiket
            if (calculatedDiscount > originalPrice) {
                calculatedDiscount = originalPrice;
            }

            // 7. Siapkan data output
            const resultToParent: PromotionResult = {
                promotionId: foundPromo.id,
                promotionCode: foundPromo.code,
                discountAmount: calculatedDiscount,
            };

            console.log("Promotion Valid:", resultToParent);

            // 8. Update State & Parent
            setAppliedPromo(foundPromo);
            onApplyPromotion(resultToParent);

        } catch (err: any) {
            console.error("Promotion Error:", err);
            const msg = err.response?.data?.message || err.message || "Gagal memproses promosi";
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
                        <p className="text-xs text-purple-800 font-bold">Promosi Event Dipakai</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-purple-700">{appliedPromo.code}</p>
                            <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full font-bold">
                                {/* Tampilkan label sesuai tipe */}
                                {appliedPromo.type === "PERCENTAGE"
                                    ? `${appliedPromo.value}% OFF`
                                    : `- ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(appliedPromo.value)}`}
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
        </div>
    );
}
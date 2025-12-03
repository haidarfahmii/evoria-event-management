"use client";

import { useState } from "react";
import { MdLocalOffer, MdCheckCircle, MdCancel, MdClose } from "react-icons/md";
import { ImSpinner8 } from "react-icons/im";
import axiosInstance from "@/utils/axiosInstance";

// 1. Interface Data MENTAH dari API (Database structure)
export interface CouponData {
    id: string;
    code: string;
    percentage: number;
    expiredAt: string;
}

// 2. Interface Data BERSIH untuk Parent (Yang dikirim ke checkout)
// HAPUS 'extends CouponData'. Buat strukturnya pas sesuai kebutuhan saja.
export interface CouponResult {
    couponId: string;
    couponCode: string;
    discountAmount: number;
}

interface CouponWidgetProps {
    onApplyCoupon: (coupon: CouponResult) => void;
    onRemoveCoupon: () => void;
    originalPrice: number;
}

export default function CouponWidget({
    onApplyCoupon,
    onRemoveCoupon,
    originalPrice,
}: CouponWidgetProps) {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // State lokal tetap menggunakan CouponData (data lengkap) untuk tampilan UI
    const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);

    const handleApply = async () => {
        if (!code) return;

        setIsLoading(true);
        setError("");

        try {
            // 1. Fetch semua kupon user
            const response = await axiosInstance.get("/profile/coupons");
            const coupons: CouponData[] = response?.data?.data?.coupons || [];

            // 2. Normalisasi input user (Huruf Besar)
            const inputCode = code.toUpperCase();

            // 3. Cari kupon yang cocok
            const foundCoupon = coupons.find((c) => c.code.toUpperCase() === inputCode);

            // 4. Validasi: Jika tidak ketemu
            if (!foundCoupon) {
                throw new Error("Kode kupon tidak ditemukan / salah");
            }

            // 5. Validasi: Cek Kadaluarsa
            const now = new Date();
            const expiredDate = new Date(foundCoupon.expiredAt);

            if (expiredDate < now) {
                throw new Error(`Kupon sudah kadaluarsa pada ${expiredDate.toLocaleDateString('id-ID')}`);
            }

            // 6. Hitung Nominal Diskon
            const calculatedDiscount = (originalPrice * foundCoupon.percentage) / 100;

            // 7. Siapkan data untuk Parent Component
            // Interface 'CouponResult' di atas sudah disesuaikan, jadi error akan hilang.
            const resultToParent: CouponResult = {
                couponId: foundCoupon.id,
                couponCode: foundCoupon.code,
                discountAmount: calculatedDiscount,
            };

            console.log("Kupon Valid:", resultToParent);

            // 8. Update State
            setAppliedCoupon(foundCoupon);
            onApplyCoupon(resultToParent);

        } catch (err: any) {
            // console.error("Coupon Error:", err);
            const msg = err.response?.data?.message || err.message || "Gagal memproses kupon";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = () => {
        setAppliedCoupon(null);
        setCode("");
        setError("");
        onRemoveCoupon();
    };

    if (appliedCoupon) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MdCheckCircle className="text-green-600 text-xl" />
                    <div>
                        <p className="text-xs text-green-800 font-bold">Kupon Digunakan</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-green-700">{appliedCoupon.code}</p>
                            <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-bold">
                                {appliedCoupon.percentage}% OFF
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
                <MdLocalOffer /> Have a Voucher Code?
            </label>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                    placeholder="e.g WELCOME123"
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-all uppercase"
                    disabled={isLoading}
                />
                <button
                    onClick={handleApply}
                    disabled={!code || isLoading}
                    className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors flex items-center"
                >
                    {isLoading ? <ImSpinner8 className="animate-spin" /> : "Apply"}
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
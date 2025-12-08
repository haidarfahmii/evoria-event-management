"use client";

import { useState, useEffect } from "react";
import { MdLocalOffer, MdCheckCircle, MdCancel, MdClose } from "react-icons/md";
import { ImSpinner8 } from "react-icons/im";
import axiosInstance from "@/utils/axiosInstance";

// 1. Interface Data MENTAH dari API (Database structure)
export interface CouponData {
  id: string;
  code: string;
  percentage: number;
  expiresAt: string;
  isUsed: boolean;
}

// 2. Interface Data BERSIH untuk Parent (Yang dikirim ke checkout)
// HAPUS 'extends CouponData'. Buat strukturnya pas sesuai kebutuhan saja.
export interface CouponResult {
  couponId: string;
  couponCode: string;
  discountAmount: number;
}

interface CouponWidgetProps {
  originalPrice: number;
  qty: number;
  onApplyCoupon: (coupon: CouponResult) => void;
  onRemoveCoupon: () => void;
}

export default function CouponWidget({
  onApplyCoupon,
  onRemoveCoupon,
  originalPrice,
  qty,
}: CouponWidgetProps) {
  const [availableCoupons, setAvailableCoupons] = useState<CouponData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State lokal tetap menggunakan CouponData (data lengkap) untuk tampilan UI
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);

  // Auto-remove coupon saat qty berubah
  useEffect(() => {
    if (appliedCoupon) {
      console.log("🔄 Qty changed, removing coupon. User must re-apply.");
      handleRemove();
    }
  }, [qty]);

  // Fetch available coupons
  const fetchCoupons = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get("/profile/coupons");
      const coupons: CouponData[] = response.data?.data?.coupons || [];

      // Filter: hanya tampilkan coupon yang belum expired dan belum used
      const validCoupons = coupons.filter((c) => {
        const isExpired = new Date(c.expiresAt) < new Date();
        return !c.isUsed && !isExpired;
      });

      setAvailableCoupons(validCoupons);

      if (validCoupons.length === 0) {
        setError("Anda tidak memiliki kupon yang tersedia");
      }
    } catch (err: any) {
      console.error("Error fetching coupons:", err);
      setError(err.response?.data?.message || "Gagal memuat kupon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (coupon: CouponData) => {
    // hitung total price berdasarkan qty saat ini
    const totalPrice = originalPrice * qty;

    // Hitung diskon dari TOTAL HARGA
    const discountAmount = Math.floor((totalPrice * coupon.percentage) / 100);

    // Siapkan data untuk parent
    const result: CouponResult = {
      couponId: coupon.id,
      couponCode: coupon.code,
      discountAmount: discountAmount,
    };

    // debugging
    console.log("✅ Coupon applied:", result);
    console.log(`   Qty: ${qty}`);
    console.log(`   Price per ticket: Rp ${originalPrice.toLocaleString()}`);
    console.log(`   Total Price: Rp ${totalPrice.toLocaleString()}`);
    console.log(
      `   Discount (${
        coupon.percentage
      }%): Rp ${discountAmount.toLocaleString()}`
    );

    setAppliedCoupon(coupon);
    onApplyCoupon(result);
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
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
              <p className="text-sm font-semibold text-green-700">
                {appliedCoupon.code}
              </p>
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
        <MdLocalOffer className="text-green-600" /> Punya Kupon Diskon?
      </label>

      {availableCoupons.length === 0 && !isLoading && !error && (
        <button
          onClick={fetchCoupons}
          className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium text-sm py-2.5 px-4 rounded-lg transition-colors"
        >
          Lihat Kupon Tersedia
        </button>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-3 text-gray-500 text-sm">
          <ImSpinner8 className="animate-spin mr-2" />
          Memuat kupon...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1 text-orange-600 text-xs font-medium bg-orange-50 p-2 rounded-lg">
          <MdCancel /> {error}
        </div>
      )}

      {availableCoupons.length > 0 && (
        <div className="space-y-2">
          {availableCoupons.map((coupon) => (
            <button
              key={coupon.id}
              onClick={() => handleApply(coupon)}
              className="w-full flex justify-between items-center p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all group"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-green-800">
                  {coupon.code}
                </p>
                <p className="text-xs text-green-600">
                  Diskon {coupon.percentage}%
                </p>
                <p className="text-[10px] text-gray-500">
                  Berlaku hingga{" "}
                  {new Date(coupon.expiresAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <span className="text-green-600 text-xs font-semibold group-hover:text-green-700">
                Pakai →
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-1">
        💡 Kupon hanya bisa digunakan 1x per transaksi
      </p>
    </div>
  );
}

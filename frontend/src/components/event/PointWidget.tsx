"use client";

import { useState, useEffect } from "react";
import { MdMonetizationOn, MdInfoOutline } from "react-icons/md";
import { ImSpinner8 } from "react-icons/im";
import axiosInstance from "@/utils/axiosInstance";

interface PointWidgetProps {
    originalPrice: number; // Harga total saat ini (untuk membatasi max penggunaan)
    onApplyPoints: (amount: number) => void;
}

interface PointResponse {
    totalPoints: number;
    points: {
        id: string;
        amount: number;
        expiresAt: string;
    }[];
}

export default function PointWidget({ originalPrice, onApplyPoints }: PointWidgetProps) {
    const [totalPoints, setTotalPoints] = useState<number>(0);
    const [redeemAmount, setRedeemAmount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Konstanta kelipatan
    const STEP = 10000;

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const response = await axiosInstance.get("/profile/points");
                // Safety check jika response data structure berbeda
                const points = response?.data?.data?.totalPoints || 0;
                setTotalPoints(points);
            } catch (error) {
                console.error("Failed to fetch points:", error);
                setTotalPoints(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPoints();
    }, []);

    const maxRedeemableByPrice = Math.floor(originalPrice / STEP) * STEP;
    const maxRedeemableByBalance = Math.floor(totalPoints / STEP) * STEP;

    // Ambil nilai terkecil antara batas saldo vs batas harga
    const maxRedeemable = Math.min(maxRedeemableByBalance, maxRedeemableByPrice);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setRedeemAmount(val);
        onApplyPoints(val);
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                <ImSpinner8 className="animate-spin" /> Memuat poin...
            </div>
        );
    }

    // Jika user tidak punya cukup poin untuk kelipatan 10.000 pertama
    if (totalPoints < STEP) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start gap-2 text-gray-500">
                <MdMonetizationOn className="text-gray-400 text-xl mt-0.5" />
                <div className="text-xs">
                    <p className="font-semibold">Poin tidak mencukupi</p>
                    <p>Minimal {new Intl.NumberFormat("id-ID").format(STEP)} poin untuk ditukarkan.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            {/* Header Info */}
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <MdMonetizationOn className="text-amber-600 text-lg" />
                    Tukarkan Poin
                </label>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full border border-amber-200">
                    Saldo: {new Intl.NumberFormat("id-ID").format(totalPoints)}
                </span>
            </div>

            {/* Slider Controls */}
            <div className="space-y-4">
                <div className="relative w-full h-6 flex items-center">
                    <input
                        type="range"
                        min="0"
                        max={maxRedeemable}
                        step={STEP}
                        value={redeemAmount}
                        onChange={handleSliderChange}
                        disabled={maxRedeemable === 0}
                        className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Display Value */}
                <div className="flex justify-between items-center">
                    <span className="text-xs text-amber-700 font-medium">
                        Gunakan {new Intl.NumberFormat("id-ID").format(redeemAmount)} Poin
                    </span>
                    <span className="text-sm font-bold text-amber-900">
                        - {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(redeemAmount)}
                    </span>
                </div>

                {/* Info Text jika maxed out oleh harga tiket */}
                {maxRedeemableByPrice < maxRedeemableByBalance && redeemAmount === maxRedeemable && maxRedeemable > 0 && (
                    <div className="flex items-start gap-1 text-[10px] text-amber-700 bg-amber-100/50 p-1.5 rounded">
                        <MdInfoOutline className="mt-0.5" />
                        Maksimal penggunaan poin dibatasi oleh total harga tiket.
                    </div>
                )}
            </div>
        </div>
    );
}
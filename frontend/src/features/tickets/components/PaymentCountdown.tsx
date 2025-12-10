"use client";

import { useState, useEffect } from "react";

export const PaymentCountdown = ({
  expiresAt,
}: {
  expiresAt: string | null;
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiryDate = new Date(expiresAt).getTime();
      const distance = expiryDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setIsExpired(true);
        setTimeLeft("Waktu Habis");
      } else {
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Format HH:MM:SS
        setTimeLeft(
          `${hours.toString().padStart(2, "0")} : ${minutes
            .toString()
            .padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  return (
    <div
      className={`rounded-lg p-3 text-center border ${
        isExpired
          ? "bg-red-50 border-red-200 text-red-600"
          : "bg-orange-50 border-orange-200 text-orange-700"
      }`}
    >
      <p className="text-xs font-semibold mb-1 uppercase tracking-wider">
        {isExpired ? "Batas Pembayaran Berakhir" : "Sisa Waktu Pembayaran"}
      </p>
      <div className="text-2xl font-mono font-bold">
        {timeLeft || "-- : -- : --"}
      </div>
    </div>
  );
};

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // *Note: Perlu buat/import Avatar jika belum ada, atau pakai div biasa
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2 } from "lucide-react";

// Mock Avatar fallback karena belum ada di ui component yg dilampirkan
const AvatarCircle = ({
  src,
  fallback,
}: {
  src?: string;
  fallback: string;
}) => (
  <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-100">
    {src ? (
      <img src={src} alt="Avatar" className="h-full w-full object-cover" />
    ) : (
      <span className="text-xs font-bold text-slate-500">{fallback}</span>
    )}
  </div>
);

export function RecentSales() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/transactions");
        // Ambil 5 transaksi terakhir saja
        setTransactions(res.data.data.transactions.slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-slate-500 text-center">
          Belum ada transaksi.
        </p>
      ) : (
        transactions.map((trx) => (
          <div key={trx.id} className="flex items-center">
            <AvatarCircle
              src={trx.userAvatarUrl} // Backend perlu kirim ini jika ada, atau pakai placeholder
              fallback={trx.userName?.substring(0, 2).toUpperCase() || "??"}
            />
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{trx.userName}</p>
              <p className="text-xs text-slate-500">{trx.eventName}</p>
            </div>
            <div className="ml-auto font-medium text-sm">
              +
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(trx.finalPrice)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

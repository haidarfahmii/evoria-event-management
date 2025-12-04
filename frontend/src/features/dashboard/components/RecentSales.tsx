"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2 } from "lucide-react";
import { TransactionStatus } from "@/@types";

// Avatar Component
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

// Helper Function: Format Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper Function: Get Status Config (label, color, badge)
const getStatusConfig = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.DONE:
      return {
        label: "+ " + formatRupiah(0), // akan di-replace dengan amount
        color: "text-green-600",
        badge: "Berhasil",
        badgeColor: "bg-green-100 text-green-700 border-green-300",
        showAmount: true,
        prefix: "+",
      };
    case TransactionStatus.WAITING_CONFIRMATION:
      return {
        label: "Menunggu Konfirmasi",
        color: "text-orange-600",
        badge: "Pending",
        badgeColor: "bg-orange-100 text-orange-700 border-orange-300",
        showAmount: true,
        prefix: "",
      };
    case TransactionStatus.WAITING_PAYMENT:
      return {
        label: "Menunggu Pembayaran",
        color: "text-slate-500",
        badge: "Belum Bayar",
        badgeColor: "bg-slate-100 text-slate-600 border-slate-300",
        showAmount: true,
        prefix: "",
      };
    default:
      return {
        label: "Status Tidak Diketahui",
        color: "text-slate-400",
        badge: status,
        badgeColor: "bg-slate-100 text-slate-600 border-slate-300",
        showAmount: false,
        prefix: "",
      };
  }
};

export function RecentSales() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Backend sudah handle filter + limit + sorting
        const res = await axiosInstance.get("/dashboard/recent-transactions", {
          params: {
            limit: 5,
          },
        });

        // Backend sudah return data yang sudah di-filter dan di-sort
        // Tidak perlu slice lagi karena backend sudah handle limit
        setTransactions(res.data.data.transactions);
      } catch (error) {
        console.error("Failed to fetch recent transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          Belum ada transaksi.
        </p>
      ) : (
        transactions.map((trx) => {
          const statusConfig = getStatusConfig(trx.status);

          return (
            <div
              key={trx.id}
              className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0"
            >
              {/* Avatar */}
              <AvatarCircle
                src={trx.userAvatarUrl}
                fallback={trx.userName?.substring(0, 2).toUpperCase() || "??"}
              />

              {/* Info Transaksi */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {trx.userName}
                  </p>
                  {/* Badge Status */}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusConfig.badgeColor}`}
                  >
                    {statusConfig.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {trx.eventName}
                </p>
              </div>

              {/* Amount & Status Label */}
              <div className="text-right shrink-0">
                {/* Tampilkan amount dengan status */}
                {statusConfig.showAmount && (
                  <>
                    {/* Jika DONE, tampilkan hijau dengan + */}
                    {trx.status === TransactionStatus.DONE && (
                      <p className={`text-sm font-bold ${statusConfig.color}`}>
                        + {formatRupiah(trx.finalPrice)}
                      </p>
                    )}

                    {/* Jika WAITING_CONFIRMATION, tampilkan label + amount */}
                    {trx.status === TransactionStatus.WAITING_CONFIRMATION && (
                      <div className="text-right">
                        <p
                          className={`text-xs font-medium ${statusConfig.color} mb-0.5`}
                        >
                          {statusConfig.label}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          ({formatRupiah(trx.finalPrice)})
                        </p>
                      </div>
                    )}

                    {/* Jika WAITING_PAYMENT, tampilkan label + amount */}
                    {trx.status === TransactionStatus.WAITING_PAYMENT && (
                      <div className="text-right">
                        <p
                          className={`text-xs font-medium ${statusConfig.color} mb-0.5`}
                        >
                          {statusConfig.label}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          ({formatRupiah(trx.finalPrice)})
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

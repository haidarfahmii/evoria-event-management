import { TransactionStatus } from "@/@types";
import { cn } from "@/lib/utils";

const TRANSACTION_STATUS_LABELS = {
  WAITING_PAYMENT: "Menunggu Pembayaran",
  WAITING_CONFIRMATION: "Menunggu Konfirmasi",
  DONE: "Selesai",
  REJECTED: "Ditolak",
  EXPIRED: "Kadaluarsa",
  CANCELLED: "Dibatalkan",
};

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

const statusConfig: Record<TransactionStatus, { className: string }> = {
  [TransactionStatus.WAITING_PAYMENT]: {
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  [TransactionStatus.WAITING_CONFIRMATION]: {
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [TransactionStatus.DONE]: {
    className: "bg-green-100 text-green-700 border-green-200",
  },
  [TransactionStatus.REJECTED]: {
    className: "bg-red-100 text-red-700 border-red-200",
  },
  [TransactionStatus.EXPIRED]: {
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
  [TransactionStatus.CANCELLED]: {
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const label = TRANSACTION_STATUS_LABELS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
        config.className,
        className
      )}
    >
      {label}
    </span>
  );
}

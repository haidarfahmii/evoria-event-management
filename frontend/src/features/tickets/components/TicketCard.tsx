import { Ticket, Calendar, Clock, QrCode, Copy, FileText } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { TransactionStatus, Transaction } from "../types";
import { StatusBadge } from "@/components/ui/shared/statusBadge";
import { formatRupiah } from "@/utils/formatters";

interface TicketCardProps {
  transaction: Transaction;
  onClick: () => void;
}

export const TicketCard = ({ transaction, onClick }: TicketCardProps) => {
  const imageUrl =
    transaction.event.imageUrl ||
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop";

  const displayDate = format(new Date(transaction.createdAt), "dd MMM yyyy", {
    locale: idLocale,
  });

  const displayTime =
    format(new Date(transaction.createdAt), "HH:mm", { locale: idLocale }) +
    " WIB";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="w-full md:w-48 h-32 md:h-auto shrink-0 relative bg-gray-200">
          <Image
            src={imageUrl}
            alt={transaction.eventName}
            fill
            className="object-cover w-full h-full"
          />
          <div className="absolute top-2 left-2 md:hidden">
            <StatusBadge status={transaction.status} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="hidden md:block mb-2">
                <StatusBadge status={transaction.status} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                {transaction.eventName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} /> {displayDate}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} /> {displayTime}
                </div>
                <div className="flex items-center gap-1">
                  <Ticket size={14} /> {transaction.qty} Tiket
                </div>
              </div>
            </div>

            {/* Price (Desktop) */}
            <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500">Total Harga</span>
              <span className="font-bold text-orange-600 text-lg">
                {formatRupiah(transaction.finalPrice)}
              </span>
            </div>
          </div>

          {/* Footer / Actions */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-hidden w-full md:w-auto">
              <FileText size={14} className="shrink-0" />
              <span className="truncate">ID: {transaction.invoiceId}</span>
              <button
                className="text-blue-600 hover:text-blue-800 ml-1 shrink-0"
                title="Copy ID"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(transaction.invoiceId);
                }}
              >
                <Copy size={12} />
              </button>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="md:hidden flex flex-col">
                <span className="text-[10px] text-gray-500">Total Harga</span>
                <span className="font-bold text-orange-600 text-base">
                  {formatRupiah(transaction.finalPrice)}
                </span>
              </div>

              {transaction.status === TransactionStatus.WAITING_PAYMENT && (
                <Button
                  onClick={onClick}
                  size="sm"
                  className="ml-auto bg-orange-500 hover:bg-orange-600"
                >
                  Bayar & Upload
                </Button>
              )}

              {transaction.status === TransactionStatus.DONE && (
                <Button
                  onClick={onClick}
                  size="sm"
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                >
                  <QrCode size={16} className="mr-2" /> E-Ticket
                </Button>
              )}

              {/* Default button for other statuses */}
              {![
                TransactionStatus.WAITING_PAYMENT,
                TransactionStatus.DONE,
              ].includes(transaction.status) && (
                <Button
                  onClick={onClick}
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                >
                  Lihat Detail
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

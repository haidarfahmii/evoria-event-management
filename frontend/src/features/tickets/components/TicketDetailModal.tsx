"use client";

import { useState } from "react";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  X,
  Download,
  Loader2,
  UploadCloud,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { formatRupiah } from "@/utils/formatters";
import { StatusBadge } from "@/components/ui/shared/statusBadge";
import axiosInstance from "@/utils/axiosInstance";
import { TransactionStatus, Transaction } from "@/features/tickets/types";
import { PaymentCountdown } from "@/features/tickets/components/PaymentCountdown";
import { toast } from "react-toastify";

interface TicketDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSuccessUpload: () => void;
}

export const TicketDetailModal = ({
  transaction,
  onClose,
  onSuccessUpload,
}: TicketDetailModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!transaction) return null;

  const transactionDate = format(
    new Date(transaction.createdAt),
    "dd MMMM yyyy",
    {
      locale: idLocale,
    }
  );
  const transactionTime =
    format(new Date(transaction.createdAt), "HH:mm", { locale: idLocale }) +
    " WIB";

  // Event Date Range: startDate - endDate
  const eventStartDate = new Date(transaction.event.startDate as string);

  // Check if endDate exists
  const eventEndDate = transaction.event.endDate
    ? new Date(transaction.event.endDate as string)
    : null;

  // Format event date display
  let eventDateDisplay = "";

  if (eventEndDate) {
    // Check if same day
    const isSameDay =
      eventStartDate.getDate() === eventEndDate.getDate() &&
      eventStartDate.getMonth() === eventEndDate.getMonth() &&
      eventStartDate.getFullYear() === eventEndDate.getFullYear();

    if (isSameDay) {
      // Same day: "15 Desember 2025"
      eventDateDisplay = format(eventStartDate, "dd MMMM yyyy", {
        locale: idLocale,
      });
    } else {
      // Different days
      const isSameMonth =
        eventStartDate.getMonth() === eventEndDate.getMonth() &&
        eventStartDate.getFullYear() === eventEndDate.getFullYear();

      if (isSameMonth) {
        // Same month: "15 - 17 Desember 2025"
        eventDateDisplay = `${format(eventStartDate, "dd", {
          locale: idLocale,
        })} - ${format(eventEndDate, "dd MMMM yyyy", { locale: idLocale })}`;
      } else {
        // Different month: "30 Des - 02 Jan 2025"
        eventDateDisplay = `${format(eventStartDate, "dd MMM", {
          locale: idLocale,
        })} - ${format(eventEndDate, "dd MMM yyyy", { locale: idLocale })}`;
      }
    }
  } else {
    // No endDate, just show startDate
    eventDateDisplay = format(eventStartDate, "dd MMMM yyyy", {
      locale: idLocale,
    });
  }

  const displayVenue = transaction.event.venue || "Venue TBA";

  // --- LOGIC UPLOAD ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validasi ukuran (max 2MB misalnya)
      if (selectedFile.size > 2 * 1024 * 1024) {
        setUploadError("Ukuran file maksimal 2MB");
        return;
      }
      // Validasi tipe
      if (
        !["image/jpeg", "image/png", "image/jpg"].includes(selectedFile.type)
      ) {
        setUploadError("Hanya format JPG, JPEG, dan PNG yang diperbolehkan");
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setUploadError(null);
    }
  };

  const handleUploadPayment = async () => {
    if (!file) {
      setUploadError("Mohon pilih file bukti transfer terlebih dahulu.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("paymentProof", file);

      // endpoint disesuaikan dengan request: transactions/:transactionId/upload-payment
      const response = await axiosInstance.patch(
        `/transactions/${transaction.id}/upload-payment`,
        formData
      );

      if (response.data.success || response.status === 200) {
        toast.success("Bukti pembayaran berhasil diupload!");
        onSuccessUpload(); // Refresh data di parent
        onClose();
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(
        err.response?.data?.message || "Gagal mengupload bukti pembayaran."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#F4F7FE] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200 max-h-[90vh] md:max-h-none overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/50 p-2 rounded-full hover:bg-white text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* LEFT SIDE: Visual & Details */}
        <div className="w-full md:w-2/3 bg-white p-6 md:p-8 flex flex-col relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="font-black text-xl text-[#00388D] flex items-center gap-1">
              <Ticket className="w-6 h-6 text-yellow-400" /> EVORIA
            </div>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <span className="text-sm font-semibold text-gray-500">
              E-Ticket / Invoice
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {transaction.event.name}
          </h2>

          <div className="flex flex-col gap-6">
            {/* ROW 1: Tanggal Transaksi | Waktu Transaksi */}
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Tanggal Transaksi
                </p>
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <Calendar size={18} className="text-blue-600" />
                  {transactionDate}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Waktu Transaksi
                </p>
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <Clock size={18} className="text-blue-600" />
                  {transactionTime}
                </div>
              </div>
            </div>

            {/* ROW 2: Tanggal Event (with date range) */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                Tanggal Event
              </p>
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <Calendar size={18} className="text-green-600" />
                {eventDateDisplay}
              </div>
            </div>

            {/* ROW 3: Lokasi Event */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                Lokasi Event
              </p>
              <div className="flex items-start gap-2 text-gray-800 font-semibold">
                <MapPin size={18} className="text-red-600 mt-0.5 shrink-0" />
                {displayVenue}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col gap-3">
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-xs text-gray-500">Transaction ID</span>
                <span className="text-sm font-mono font-bold text-blue-800 tracking-wider truncate max-w-[150px]">
                  {transaction.invoiceId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Pembeli</span>
                <span className="text-sm font-semibold text-gray-800">
                  {transaction.userName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Total Tagihan</span>
                <span className="text-sm font-bold text-orange-600">
                  {formatRupiah(transaction.finalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Action / QR / Upload */}
        <div className="w-full md:w-1/3 bg-gray-50 p-6 md:p-8 flex flex-col border-l-0 md:border-l-2 border-dashed border-gray-300 relative overflow-y-auto">
          {/* KONDISI 1: SUDAH SELESAI (DONE) -> Tampilkan QR */}
          {transaction.status === TransactionStatus.DONE && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 w-full max-w-[200px]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${transaction.invoiceId}`}
                  alt="QR Code"
                  className="w-full h-full opacity-90"
                />
              </div>
              <p className="text-center text-xs text-gray-500 mb-6">
                Scan QR Code ini di lokasi acara.
              </p>
              <Button className="w-full bg-[#00388D] gap-2 mb-2">
                <Download size={16} /> Download
              </Button>
            </div>
          )}

          {/* KONDISI 2: MENUNGGU PEMBAYARAN (WAITING_PAYMENT) -> Tampilkan Countdown & Upload */}
          {transaction.status === TransactionStatus.WAITING_PAYMENT && (
            <div className="flex flex-col h-full gap-4">
              <div className="mb-2">
                <StatusBadge status={transaction.status} />
              </div>

              {/* Countdown Component */}
              <PaymentCountdown expiresAt={transaction.expiresAt} />

              <div className="border-t border-gray-200 my-2"></div>

              <div className="flex-1">
                <label className="text-sm font-bold text-gray-700 block mb-2">
                  Upload Bukti Transfer
                </label>

                {/* Area Upload */}
                <div className="relative">
                  {!previewUrl ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer text-center">
                      <UploadCloud className="text-gray-400 mb-2" size={32} />
                      <p className="text-xs text-gray-500">
                        Klik untuk upload gambar
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Max 2MB (JPG/PNG)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {uploadError && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 bg-red-50 p-2 rounded text-xs">
                    <AlertCircle size={14} /> {uploadError}
                  </div>
                )}
              </div>

              <Button
                onClick={handleUploadPayment}
                disabled={!file || isUploading}
                className="w-full bg-orange-600 hover:bg-orange-700 mt-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Mengupload...
                  </>
                ) : (
                  "Konfirmasi Pembayaran"
                )}
              </Button>
            </div>
          )}

          {/* KONDISI 3: MENUNGGU KONFIRMASI (WAITING_CONFIRMATION) */}
          {transaction.status === TransactionStatus.WAITING_CONFIRMATION && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-bold text-gray-800">
                Bukti Berhasil Diupload
              </h3>
              <p className="text-xs text-gray-500 mt-2 mb-4">
                Kami sedang memverifikasi pembayaran Anda. Mohon tunggu maksimal
                3x24 jam.
              </p>
              <StatusBadge status={transaction.status} />
            </div>
          )}

          {/* KONDISI LAIN (CANCELLED / EXPIRED / REJECTED) */}
          {["CANCELLED", "EXPIRED", "REJECTED"].includes(
            transaction.status
          ) && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <X size={32} />
              </div>
              <h3 className="font-bold text-gray-700">Transaksi Tidak Aktif</h3>
              <div className="mt-4">
                <StatusBadge status={transaction.status} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { format } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format number to Indonesian Rupiah currency
 * @param amount - Number to format
 * @returns Formatted currency string (e.g., "Rp 150.000")
 */
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to Indonesian locale
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions (optional)
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return date.toLocaleDateString("id-ID", options || defaultOptions);
};

/**
 * Memformat range tanggal dan waktu event.
 * Mengembalikan object { date: string, time: string }
 */
export const formatEventRange = (
  start: string | Date,
  end: string | Date
): { date: string; time: string } => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Validasi jika tanggal invalid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { date: "-", time: "-" };
  }

  const isSameDay =
    startDate.getDate() === endDate.getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const isSameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const isSameYear = startDate.getFullYear() === endDate.getFullYear();

  // Logic Format Tanggal
  let dateString = "";
  if (isSameDay) {
    // 15 Desember 2025
    dateString = format(startDate, "dd MMMM yyyy", { locale: id });
  } else if (isSameMonth) {
    // 15 - 17 Desember 2025
    dateString = `${format(startDate, "dd")} - ${format(
      endDate,
      "dd MMMM yyyy",
      { locale: id }
    )}`;
  } else if (isSameYear) {
    // 15 Okt - 17 Des 2025
    dateString = `${format(startDate, "dd MMM", { locale: id })} - ${format(
      endDate,
      "dd MMM yyyy",
      { locale: id }
    )}`;
  } else {
    // Beda Tahun: 15 Des 2025 - 02 Jan 2026
    dateString = `${format(startDate, "dd MMM yyyy", {
      locale: id,
    })} - ${format(endDate, "dd MMM yyyy", { locale: id })}`;
  }

  // Logic Format Jam (15.00 - 20.00 WIB)
  const timeStart = format(startDate, "HH.mm", { locale: id });
  const timeEnd = format(endDate, "HH.mm", { locale: id });
  const timeString = `${timeStart} - ${timeEnd} WIB`;

  return {
    date: dateString,
    time: timeString,
  };
};

/**
 * Format date for input type="date" (YYYY-MM-DD)
 * @param dateString - ISO date string
 * @returns Formatted date string for input
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

/**
 * Format date for input type="datetime-local" (YYYY-MM-DDTHH:mm)
 * Mengambil waktu lokal pengguna (browser time)
 */
export const formatDateTimeForInput = (dateString: string | Date): string => {
  if (!dateString) return "";
  const date = new Date(dateString);

  // Mencegah error jika tanggal tidak valid
  if (isNaN(date.getTime())) return "";

  const pad = (num: number) => num.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format phone number with country code
 * @param phone - Phone number string
 * @returns Formatted phone with +62 prefix
 */
export const formatPhoneNumber = (phone: string): string => {
  let cleanPhone = phone.trim().replace(/\D/g, "");

  if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.slice(1);
  }

  return `62${cleanPhone}`;
};

/**
 * Format phone for display (remove country code)
 * @param phone - Phone with country code
 * @returns Phone without country code
 */
export const formatPhoneForDisplay = (phone: string): string => {
  if (phone.startsWith("62")) return phone.substring(2);
  if (phone.startsWith("0")) return phone.substring(1);
  return phone;
};

/**
 * Check if coupon/point is expired
 * @param expiryDate - ISO date string
 * @returns true if expired
 */
export const isExpired = (expiryDate: string): boolean => {
  return new Date(expiryDate) < new Date();
};

/**
 * Format large numbers with K/M suffix
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1.5K", "2M")
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

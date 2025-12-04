// Helper function untuk generator ID invoice
export const generateInvoiceId = (id: string, date: Date): string => {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = id.slice(-4).toUpperCase();

  return `TRX-${y}${m}${d}${suffix}`;
};

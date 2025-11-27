export const generateSlug = (text: string): string => {
  return text
    .toString() // Pastikan input adalah string
    .toLowerCase() // Ubah semua huruf menjadi kecil
    .trim() // Hapus spasi di awal dan akhir string
    .replace(/\s+/g, "-") // Ganti spasi (termasuk tab/newline) dengan tanda hubung (-)
    .replace(/[^\w\-]+/g, "") // Hapus semua karakter non-word (kecuali huruf, angka, dan -)
    .replace(/\-\-+/g, "-") // Ganti tanda hubung ganda (--) menjadi satu (-)
    .replace(/^-+/, "") // Hapus tanda hubung di awal string
    .replace(/-+$/, ""); // Hapus tanda hubung di akhir string
};

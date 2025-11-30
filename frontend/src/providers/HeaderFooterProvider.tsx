"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function HeaderFooterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Daftar path yang Navbar & Footernya ingin disembunyikan (Exact Match)
  const disabledRoutes = ["/login", "/register", "/forgot-password"];

  // Logic pengecekan:
  // 1. Cek exact match (misal: /login)
  const isExactMatch = disabledRoutes.includes(pathname);

  // 2. Cek pattern match (misal: /profile/*, /verify-email/*, /reset-password/*)
  // Kita menggunakan startsWith karena halaman profile sekarang punya layout sendiri (Sidebar)
  // dan halaman verifikasi/reset password biasanya memiliki token dinamis di URL.
  const isPatternMatch =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/transactions/my-transactions");

  const shouldHide = isExactMatch || isPatternMatch;

  return (
    <>
      {!shouldHide && <Navbar />}
      {children}
      {!shouldHide && <Footer />}
    </>
  );
}

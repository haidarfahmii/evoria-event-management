"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import {
  ChevronRight,
  Home,
  Bell,
  Plus,
  User,
  LogOut,
  ChevronDown,
  Settings,
  CalendarPlus,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Role } from "@/@types";

// Mapping path URL ke nama yang lebih user-friendly (Bahasa Indonesia)
const pathLabels: Record<string, string> = {
  profile: "Profil Saya",
  transactions: "Transaksi",
  "my-transactions": "Tiket Saya",
  settings: "Pengaturan",
  dashboard: "Organizer Dashboard",
  "create-event": "Buat Event",
  "verify-email": "Verifikasi Email",
  "change-password": "Ganti Password",
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  // Helper untuk generate breadcrumbs
  const generateBreadcrumbs = () => {
    // Hapus query params jika ada
    const asPathWithoutQuery = pathname.split("?")[0];

    // Split pathname menjadi array segment
    const asPathNestedRoutes = asPathWithoutQuery
      .split("/")
      .filter((v) => v.length > 0);

    // Build array breadcrumb
    const crumblist = asPathNestedRoutes.map((subpath, idx) => {
      // Reconstruct URL untuk href
      const href = "/" + asPathNestedRoutes.slice(0, idx + 1).join("/");

      // Ambil label dari mapping atau format manual
      let title =
        pathLabels[subpath] ||
        subpath
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize

      return { href, title };
    });

    // Tambahkan Home di awal
    return [{ href: "/", title: "Beranda" }, ...crumblist];
  };

  const breadcrumbs = generateBreadcrumbs();
  const user = session?.user;
  const isOrganizer = user?.role === Role.ORGANIZER;

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6  shadow-sm">
      {/* Left: Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="items-center text-sm text-slate-500 hidden md:flex"
      >
        <ol className="flex items-center gap-2">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isHome = index === 0;

            return (
              <Fragment key={crumb.href}>
                <li className="flex items-center">
                  {isHome ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-blue-600 transition-colors flex items-center p-1 rounded-md hover:bg-slate-100"
                      title="Kembali ke Beranda"
                    >
                      <Home size={16} />
                    </Link>
                  ) : (
                    <Link
                      href={crumb.href}
                      className={`hover:text-blue-600 transition-colors px-1 rounded-md ${
                        isLast
                          ? "font-semibold text-slate-800 pointer-events-none"
                          : "hover:bg-slate-100"
                      }`}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.title}
                    </Link>
                  )}
                </li>
                {!isLast && (
                  <ChevronRight size={14} className="text-slate-300" />
                )}
              </Fragment>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Title (When breadcrumbs hidden) */}
      <div className="md:hidden font-semibold text-slate-800">
        {breadcrumbs[breadcrumbs.length - 1]?.title || "Evoria"}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Tombol Buat Event */}
        {isOrganizer ? (
          <Link
            href="/create-event"
            className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            <CalendarPlus size={16} />
            <span>Buat Event</span>
          </Link>
        ) : (
          <button
            disabled
            title="Daftar sebagai Organizer untuk membuat event"
            className="hidden sm:flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-full text-sm font-medium cursor-not-allowed border border-slate-200"
          >
            <CalendarPlus size={16} />
            <span>Buat Event</span>
          </button>
        )}

        {/* Notifikasi */}
        <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Divider Vertical */}
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1 pl-2 rounded-full transition-all border border-transparent hover:border-slate-200"
          >
            {/* User Info (Text) */}
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-sm font-semibold text-slate-700 leading-none">
                {user?.name || "Guest"}
              </span>
              <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 rounded-sm mt-1">
                {user?.role || "Visitor"}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 border border-white shadow-sm overflow-hidden">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={16} />
              )}
            </div>

            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 hidden sm:block ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Content */}
          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsUserMenuOpen(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                {/* Mobile User Info in Dropdown */}
                <div className="md:hidden px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>

                <div className="p-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>Profil Saya</span>
                  </Link>
                  {isOrganizer && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Home size={16} />
                      <span>Dashboard Organizer</span>
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Pengaturan</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 p-1 mt-1">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    <LogOut size={16} />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

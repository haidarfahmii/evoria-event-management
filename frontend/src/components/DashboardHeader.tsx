"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState, useEffect } from "react";
import {
  ChevronRight,
  Home,
  Bell,
  User,
  LogOut,
  ChevronDown,
  CalendarPlus,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Role } from "@/@types";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { SIDEBAR_ITEMS, SidebarGroup } from "@/config/navigation";
import { useUserPoints } from "@/hooks/useUserPoints";
import PointsBadge from "./PointsBadge";

// Mapping path URL ke nama yang lebih user-friendly (Bahasa Indonesia)
const pathLabels: Record<string, string> = {
  profile: "Profil Saya",
  transactions: "Transaksi",
  settings: "Pengaturan",
  dashboard: "Organizer Dashboard",
  "create-event": "Buat Event",
  events: "Event Saya",
  "manage-access": "Kelola Akses",
  "informasi-dasar": "Informasi Dasar",
  pengaturan: "Pengaturan",
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  // ambil label dinamis dari context
  const { labels } = useBreadcrumb();

  // Helper untuk generate breadcrumbs
  const generateBreadcrumbs = () => {
    // Hapus query params jika ada
    const asPathWithoutQuery = pathname.split("?")[0];

    // Split pathname menjadi array segment
    const asPathNestedRoutes = asPathWithoutQuery
      .split("/")
      .filter((v) => v.length > 0 && v !== "member");

    return [
      { href: "/", title: "Beranda" },
      ...asPathNestedRoutes.map((subpath, idx) => {
        const href = "/" + asPathNestedRoutes.slice(0, idx + 1).join("/");

        /**
         * Logika prioritas
         * 1. Cek di Context (Dynamic ID -> Nama event)
         * 2. Cek di Static Map (pathLabels)
         * 3. Format manual (slug -> Title Case)
         */

        let title = labels[subpath] || pathLabels[subpath];

        if (!title) {
          // jika tidak ada di context/static, format manual
          title = subpath
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
          // opsional: jika masih terlihat seperti ID panjang (misal cuid), potong tampilan nya
          if (subpath.length > 20 && !subpath.includes(" ")) {
            title = `${subpath.slice(0, 8)}...`;
          }
        }

        return { href, title };
      }),
    ];
  };

  const { points, loading: pointsLoading } = useUserPoints();

  const breadcrumbs = generateBreadcrumbs();
  const user = session?.user;
  const isOrganizer = user?.role === Role.ORGANIZER;

  // Ambil menu items berdasarkan role dari SIDEBAR_ITEMS
  const role = session?.user?.role;
  const menuGroups: SidebarGroup[] =
    role === Role.ORGANIZER ? SIDEBAR_ITEMS.organizer : SIDEBAR_ITEMS.customer;

  // Debugging: Cek di console browser apakah nama berubah saat update profil
  // useEffect(() => {
  //   if (status === "authenticated") {
  //     console.log("DashboardHeader Session Updated:", {
  //       name: session?.user?.name,
  //       avatarUrl: session?.user?.avatarUrl,
  //       timeStamp: new Date().toISOString(),
  //     });
  //   }
  // }, [session, status]);

  // debugging
  // useEffect(() => {
  //   console.log("[Dashboard Header] initial Avatar URL:", user?.avatarUrl);
  // });

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm">
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
              <Fragment key={index}>
                <li className="flex items-center">
                  {isHome ? (
                    <Link
                      href="/member/dashboard"
                      className="hover:text-blue-600 transition-colors flex items-center p-1 rounded-md hover:bg-slate-100"
                      title="Kembali ke Beranda"
                    >
                      <Home size={16} />
                    </Link>
                  ) : (
                    <span
                      className={`px-1 rounded-md max-w-[200px] truncate cursor-default ${
                        isLast
                          ? "font-semibold text-slate-800" // Item terakhir (Lokasi saat ini) lebih gelap
                          : "text-slate-400" // Item tengah terlihat "disabled" (abu-abu)
                      }`}
                    >
                      {crumb.title}
                    </span>
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
        <div className="relative flex items-center gap-3">
          <div className="hidden md:block">
            <PointsBadge
              points={points}
              loading={pointsLoading}
              variant="dashboard"
            />
          </div>

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
              {user?.avatarUrl ? (
                <Image
                  src={
                    user.avatarUrl ||
                    "https://gravatar.com/avatar/62c98c481357fc079f4b1000bea954b1?s=400&d=robohash&r=x"
                  }
                  alt={user.name || "User"}
                  width={20}
                  height={20}
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
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                      {user?.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name || "User"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm mt-1 inline-block font-medium">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items dari Sidebar */}
                <div className="py-2">
                  {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      {/* Group Label */}
                      <div className="px-4 py-2">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {group.group}
                        </h3>
                      </div>

                      {/* Group Items */}
                      <div className="px-2 space-y-1">
                        {group.items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          const isActive =
                            pathname === item.href ||
                            pathname.startsWith(item.href + "/");

                          return (
                            <Link
                              key={itemIndex}
                              href={item.href}
                              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                                isActive
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                              }`}
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Icon size={16} className="shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Separator between groups */}
                      {groupIndex < menuGroups.length - 1 && (
                        <div className="my-2 border-t border-slate-100"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Logout Button */}
                <div className="border-t border-slate-100 px-2 pt-2">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-medium"
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

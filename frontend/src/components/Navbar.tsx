"use client";

import Link from "next/link";
import { SIDEBAR_ITEMS, SidebarGroup } from "@/config/navigation";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Compass,
  CalendarPlus,
  Ticket,
  User,
  LogOut,
  ChevronDown,
  Home,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Role } from "@/@types";
import { useState } from "react";
import { useUserPoints } from "@/hooks/useUserPoints";
import PointsBadge from "./PointsBadge";
import { useSwitchRole } from "@/hooks/useSwitchRole";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const { points, loading: pointsLoading } = useUserPoints();

  const { switchRole, isLoading: isSwitching } = useSwitchRole();

  const user = session?.user;
  const isLoggedIn = status === "authenticated";
  const isOrganizer = user?.role === Role.ORGANIZER;

  const menuGroups: SidebarGroup[] = isOrganizer
    ? SIDEBAR_ITEMS.organizer
    : SIDEBAR_ITEMS.customer;

  // --- Logic Tombol "Buat Event" / "Tiket Saya" ---
  const handleActionClick = () => {
    if (!isLoggedIn) {
      // Kondisi: Tidak login -> Redirect ke Login
      router.push("/login");
    } else if (isOrganizer) {
      // Kondisi: Login Organizer -> Redirect ke Create Event
      router.push("/create-event");
    } else {
      // Fallback untuk case lain
      router.push("/login");
    }
  };

  return (
    <nav className="bg-[#0f172a] text-white w-full sticky top-0 z-50 border-b border-slate-800">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* --- BAGIAN KIRI: Logo & Search --- */}
          <div className="flex items-center gap-6 flex-1">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <div className="font-black text-xl text-white flex items-center gap-1">
                <Ticket className="w-6 h-6 text-yellow-400" /> EVORIA
                <span className="text-blue-500">.</span>
              </div>
            </Link>

            {/* Search Bar */}
            {/* <div className="hidden md:flex flex-1 max-w-md relative">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Cari event seru di sini"
                  className="w-full pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400 focus-visible:ring-blue-500 rounded-full h-10"
                />
              </div>
            </div> */}
          </div>

          {/* --- BAGIAN KANAN: Menu & Auth --- */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Tombol Buat Event / Tiket Saya (Dynamic) */}
            <div className="hidden md:block">
              {isLoggedIn && user?.role === Role.CUSTOMER ? (
                // Kondisi: Login Customer -> Tombol Tiket Saya
                <Link href="/member/tiket-saya">
                  <button className="flex items-center gap-2 text-slate-300 hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                    <Ticket size={18} />
                    Tiket Saya
                  </button>
                </Link>
              ) : (
                // Kondisi Guest & Organizer -> Tombol Buat Event
                <button
                  onClick={handleActionClick}
                  className="flex items-center gap-2 text-slate-300 hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  <CalendarPlus size={18} />
                  Buat Event
                </button>
              )}
            </div>

            {/* Tombol Jelajah Event */}
            <Link href="/" className="hidden md:block">
              <button className="flex items-center gap-2 text-slate-300 hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                <Compass size={18} />
                Jelajah Event
              </button>
            </Link>

            {/* Separator Vertical */}
            <div className="h-6 w-px bg-slate-700 mx-1 hidden md:block"></div>

            {/* Auth Buttons (Login/Register OR User Menu) */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
            ) : !isLoggedIn ? (
              <>
                {/* Tombol Register (Daftar) */}
                <Link href="/register">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Daftar
                  </Button>
                </Link>

                {/* Tombol Login (Masuk) */}
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 cursor-pointer">
                    Masuk
                  </Button>
                </Link>
              </>
            ) : (
              /* User Menu Dropdown (seperti DashboardHeader) */
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 hover:bg-slate-800 p-1.5 pr-3 rounded-full transition-all border border-transparent hover:border-slate-700"
                >
                  {/* Points Badge (before user menu) */}
                  <div className="hidden lg:block">
                    <PointsBadge
                      points={points}
                      loading={pointsLoading}
                      variant="navbar"
                    />
                  </div>
                  {/* <div className="hidden lg:flex flex-col items-end mr-1">
                    <span className="text-xs font-semibold text-slate-200 leading-none">
                      {user?.name || "Guest"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-800 px-1.5 rounded-sm mt-1">
                      {user?.role || "Visitor"}
                    </span>
                  </div> */}

                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
                    {user?.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-slate-300 text-xs">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs font-semibold text-slate-200 max-w-20 truncate leading-tight">
                      {user?.name}
                    </span>
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
                      {/* Mobile User Info in Dropdown */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          {/* Bigger avatar */}
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
                          {/* User info beside avatar */}
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

                                if (item.key === "switch_role") {
                                  return (
                                    <button
                                      key={itemIndex}
                                      onClick={() => {
                                        setIsUserMenuOpen(false); // Tutup menu
                                        switchRole(); // Panggil fungsi switch
                                      }}
                                      disabled={isSwitching}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-medium text-left"
                                    >
                                      {isSwitching ? (
                                        <Loader2
                                          size={16}
                                          className="animate-spin text-blue-600 shrink-0"
                                        />
                                      ) : (
                                        <Icon size={16} className="shrink-0" />
                                      )}
                                      <span className="truncate">
                                        {isSwitching
                                          ? "Memproses..."
                                          : item.label}
                                      </span>
                                    </button>
                                  );
                                }

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
                                    <span className="truncate">
                                      {item.label}
                                    </span>
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
                          onClick={() => signOut({ callbackUrl: "/" })}
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

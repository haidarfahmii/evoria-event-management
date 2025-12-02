"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Role } from "@/@types";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const user = session?.user;
  const isLoggedIn = status === "authenticated";
  const isOrganizer = user?.role === Role.ORGANIZER;

  // --- Logic Tombol "Buat Event" / "Tiket Saya" ---
  const handleActionClick = () => {
    if (!isLoggedIn) {
      // Kondisi: Tidak login -> Redirect ke Login
      router.push("/login");
    } else if (user?.role === Role.ORGANIZER) {
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
              <div className="font-bold text-2xl tracking-tight flex items-center">
                <span className="text-white">Evoria</span>
                <span className="text-blue-500">.</span>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Cari event seru di sini"
                  className="w-full pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400 focus-visible:ring-blue-500 rounded-full h-10"
                />
              </div>
            </div>
          </div>

          {/* --- BAGIAN KANAN: Menu & Auth --- */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Tombol Buat Event / Tiket Saya (Dynamic) */}
            <div className="hidden md:block">
              {isLoggedIn && user?.role === Role.CUSTOMER ? (
                // Kondisi: Login Customer -> Tombol Tiket Saya
                <Link href="/member/tiket-saya">
                  <button className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                    <Ticket size={18} />
                    Tiket Saya
                  </button>
                </Link>
              ) : (
                // Kondisi Guest) & (Organizer) -> Tombol Buat Event
                <button
                  onClick={handleActionClick}
                  className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  <CalendarPlus size={18} />
                  Buat Event
                </button>
              )}
            </div>

            {/* Tombol Jelajah Event */}
            <Link href="/" className="hidden md:block">
              <button className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
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
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      {/* Mobile User Info in Dropdown */}
                      <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                        <p className="text-sm font-semibold text-slate-800">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user?.email}
                        </p>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm mt-1 inline-block font-medium">
                          {user?.role}
                        </span>
                      </div>

                      <div className="p-1">
                        {isOrganizer && (
                          <Link
                            href="/member/dashboard"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Home size={16} />
                            <span>Dashboard Organizer</span>
                          </Link>
                        )}
                        <Link
                          href="/member/profile/informasi-dasar"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={16} />
                          <span>Profil Saya</span>
                        </Link>

                        <Link
                          href="/member/profile/pengaturan"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings size={16} />
                          <span>Pengaturan</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 p-1 mt-1">
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

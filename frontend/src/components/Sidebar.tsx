"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Compass,
  User,
  Settings,
  Repeat,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BsTicketPerforatedFill as Ticket } from "react-icons/bs";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Fungsi toggle sidebar
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Definisi Menu
  const menuItems = [
    {
      group: "Menu Utama",
      items: [
        { label: "Jelajah Event", href: "/", icon: Compass },
        {
          label: "Tiket Saya",
          href: "/transactions/my-transactions",
          icon: Ticket,
        },
      ],
    },
    {
      group: "Akun",
      items: [
        { label: "Informasi Pribadi", href: "/profile", icon: User },
        { label: "Pengaturan", href: "/settings", icon: Settings },
      ],
    },
    {
      group: "Mode User",
      items: [
        {
          label: "Beralih ke Organizer",
          href: "/dashboard", // Asumsi rute dashboard organizer
          icon: Repeat,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-[#0f172a] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 sticky top-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* 1. Header / Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        {isCollapsed ? (
          <div className="font-bold text-xl bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            E
          </div>
        ) : (
          <div className="font-bold text-2xl tracking-tight">
            <span className="text-white">Evoria</span>
            <span className="text-blue-500">.</span>
          </div>
        )}
      </div>

      {/* 2. Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {menuItems.map((group, groupIndex) => (
          <div key={groupIndex} className="px-3">
            {/* Group Label (Hidden when collapsed) */}
            {!isCollapsed && (
              <h3 className="mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.group}
              </h3>
            )}

            <div className="space-y-1">
              {group.items.map((item, itemIndex) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    title={isCollapsed ? item.label : ""}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    {/* Icon */}
                    <item.icon
                      size={20}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-white" : "group-hover:text-white"
                      )}
                    />

                    {/* Label (Hide when collapsed) */}
                    <span
                      className={cn(
                        "whitespace-nowrap font-medium transition-all duration-300 origin-left",
                        isCollapsed
                          ? "opacity-0 w-0 overflow-hidden"
                          : "opacity-100 w-auto"
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Active Indicator (Left Border Effect) */}
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-400 rounded-r-full opacity-0" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Separator antar group jika collapsed agar lebih rapi */}
            {isCollapsed && groupIndex < menuItems.length - 1 && (
              <div className="my-4 border-b border-slate-800 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* 3. Footer / Collapse Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center justify-center w-full p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white",
            !isCollapsed && "justify-start gap-3"
          )}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}

          {!isCollapsed && (
            <span className="text-sm font-medium">Singkat Menu</span>
          )}
        </button>
      </div>
    </aside>
  );
}

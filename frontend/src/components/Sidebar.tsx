"use client";

import { Role } from "@/@types";
import { SIDEBAR_ITEMS, SidebarGroup } from "@/config/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // menentukan menu sidebar berdasarkan role
  const role = session?.user?.role;
  // const user = session?.user;
  const menuGroups: SidebarGroup[] =
    role === Role.ORGANIZER ? SIDEBAR_ITEMS.organizer : SIDEBAR_ITEMS.customer;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen bg-[#0f172a] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800",
          // Desktop behavior
          "hidden lg:flex lg:sticky lg:top-0",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile behavior
          "lg:translate-x-0",
          isMobileOpen
            ? "fixed inset-y-0 left-0 z-50 w-64 translate-x-0"
            : "fixed -translate-x-full"
        )}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          {isCollapsed ? (
            <Link href="/">
              <div className="font-bold text-xl bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                E
              </div>
            </Link>
          ) : (
            <Link href="/">
              <div className="font-bold text-2xl tracking-tight">
                <span className="text-white">Evoria</span>
                <span className="text-blue-500">.</span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="px-3">
              {/* Group Label (Hidden when collapsed) */}
              {!isCollapsed && (
                <h3 className="mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {group.group}
                </h3>
              )}

              <div className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  // Cek active state:
                  // 1. Exact match
                  // 2. Starts with (untuk sub-halaman), kecuali root '/' agar tidak selalu aktif
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
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
              {isCollapsed && groupIndex < menuGroups.length - 1 && (
                <div className="my-4 border-b border-slate-800 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Collapse Button (Desktop only) */}
        <div className="p-3 border-t border-slate-800 hidden lg:block">
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex items-center justify-center w-full p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white",
              !isCollapsed && "justify-start gap-3"
            )}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Singkat Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

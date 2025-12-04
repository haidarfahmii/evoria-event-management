"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type TabId = "transactions" | "attendees";

export interface Tab {
  id: TabId;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <nav className="flex gap-2 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              variant="ghost"
              className={cn(
                "relative h-auto px-6 py-4 text-sm font-medium transition-all rounded-none border-b-2 -mb-px hover:bg-slate-50",
                isActive
                  ? "border-blue-600 text-blue-600 bg-slate-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flex items-center gap-2">
                {/* Icon */}
                {tab.icon && (
                  <span className="w-4 h-4 flex items-center justify-center">
                    {tab.icon}
                  </span>
                )}

                {/* FIX: Label sebelumnya lupa dirender */}
                <span>{tab.label}</span>

                {/* Count Badge */}
                {typeof tab.count !== "undefined" && (
                  <span
                    className={cn(
                      "ml-2 px-2 py-0.5 rounded-full text-xs font-semibold",
                      isActive
                        ? "bg-blue-600 text-blue-50" // Text color diperbaiki agar kontras
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </span>

              {/* Active Indicator (Opsional, karena border-b-2 sudah menangani ini) */}
              {/* Jika ingin style spesifik tambahan bisa ditaruh disini */}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

// HAPUS BARIS INI: export type { Tab };

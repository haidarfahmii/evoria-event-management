"use client";

import { useSwitchRole } from "@/hooks/useSwitchRole";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SidebarSwitchButtonProps {
  label: string;
  icon: IconType;
  className?: string;
  isCollapsed?: boolean;
}

export default function SidebarSwitchButton({
  label,
  icon: Icon,
  className,
  isCollapsed = false,
}: SidebarSwitchButtonProps) {
  // Panggil logic dari hook
  const { switchRole, isLoading } = useSwitchRole();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    switchRole();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={isCollapsed ? label : ""}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative text-slate-400 hover:bg-slate-800 hover:text-white",
        className
      )}
    >
      {/* Icon Wrapper */}
      <div className="shrink-0">
        {isLoading ? (
          <Loader2 size={20} className="animate-spin text-blue-500" />
        ) : (
          <Icon
            size={20}
            className="group-hover:text-white transition-colors"
          />
        )}
      </div>

      {/* Label dengan Logic Collapse */}
      <span
        className={cn(
          "whitespace-nowrap font-medium transition-all duration-300 origin-left",
          isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
        )}
      >
        {isLoading ? "Memproses..." : label}
      </span>
    </button>
  );
}

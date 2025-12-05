import { Coins, Loader2 } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  loading?: boolean;
  variant?: "navbar" | "dashboard";
  className?: string;
}

/**
 * Helper function
 * Format points number with K/M suffix
 * Examples:
 * - 500 → "500"
 * - 1,000 → "1K"
 * - 1,500 → "1.5K"
 * - 25,750 → "25.8K"
 * - 1,000,000 → "1M"
 */
const formatPoints = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

export default function PointsBadge({
  points,
  loading = false,
  variant = "navbar",
  className = "",
}: PointsBadgeProps) {
  if (loading) {
    return (
      <div
        className={`flex items-center gap-1.5 ${
          variant === "navbar"
            ? "text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full"
            : "text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full"
        } ${className}`}
      >
        <Loader2 size={14} className="animate-spin" />
        <span className="text-xs font-medium">...</span>
      </div>
    );
  }

  const variantStyles = {
    navbar: `
      bg-gradient-to-r from-yellow-500/10 to-orange-500/10 
      border border-yellow-500/20 
      text-yellow-400 
      hover:from-yellow-500/15 hover:to-orange-500/15
      hover:border-yellow-500/30
    `,
    dashboard: `
      bg-gradient-to-r from-yellow-50 to-orange-50 
      border border-yellow-200 
      text-yellow-600
      hover:from-yellow-100 hover:to-orange-100
      hover:border-yellow-300
    `,
  };

  return (
    <div
      className={`
        flex items-center gap-1.5 
        px-2.5 py-1 
        rounded-full 
        transition-all duration-200
        cursor-default
        ${variantStyles[variant]}
        ${className}
      `}
      title={`${points.toLocaleString()} points`}
    >
      {/* Icon */}
      <Coins size={14} className="shrink-0" strokeWidth={2.5} />

      {/* Points Number */}
      <span className="text-xs font-bold tabular-nums">
        {formatPoints(points)}
      </span>
    </div>
  );
}

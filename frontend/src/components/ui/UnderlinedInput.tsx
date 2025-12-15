// UnderlinedInput.tsx (TypeScript)
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ambil tipe props asli dari komponen Input
type BaseInputProps = React.ComponentProps<typeof Input>;

interface UnderlinedInputProps extends BaseInputProps {
  icon?: React.ComponentType<{ className?: string }>;
  /** error bisa string (pesan) atau boolean */
  error?: string | boolean;
  className?: string;
}

export default function UnderlinedInput({
  icon: Icon,
  error,
  className,
  ...props
}: UnderlinedInputProps) {
  return (
    <div className="relative group">
      {Icon && (
        <Icon className="w-4 h-4 absolute left-3 top-3 text-slate-400 z-10" />
      )}

      <Input
        className={cn(
          Icon ? "pl-10" : "pl-3",
          "bg-transparent border-0 shadow-none focus-visible:ring-0 relative z-10",
          error ? "text-red-600" : "",
          className
        )}
        {...(props as BaseInputProps)}
      />

      <span
        className={cn(
          "absolute bottom-0 left-0 w-full h-px",
          error ? "bg-red-500" : "bg-slate-300"
        )}
      />
      <span
        className={cn(
          "absolute bottom-0 left-1/2 w-0 h-0.5 transition-all duration-300",
          error ? "bg-red-500" : "bg-primary",
          "group-focus-within:w-full group-focus-within:left-0"
        )}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormikProps } from "formik";

interface FormInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  formik: FormikProps<any>; // untuk menerima object formik
  disabled?: boolean;
  className?: string;
}

export default function FormInput({
  name,
  label,
  type = "text",
  placeholder,
  formik,
  disabled = false,
  className,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const isPassword = type === "password";
  const hasError = formik.touched[name] && formik.errors[name];

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name} className={hasError ? "text-red-500" : ""}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          disabled={disabled}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          className={cn(
            isPassword ? "pr-10" : "",
            hasError ? "border-red-500 focus-visible:ring-red-500" : ""
          )}
        />

        {/* Fitur Show/Hide Password Otomatis */}
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1} // supaya tidak terkena tab focus saat navigasi keyboard
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p className="text-xs text-red-500 font-medium">
          {formik.errors[name] as string}
        </p>
      )}
    </div>
  );
}

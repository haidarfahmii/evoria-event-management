"use client";

import useFormRegister from "../hooks/useFormRegister";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FaUser, FaUsers } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import FormInput from "./FormInput";
import { Role } from "@/@types";

export default function RegisterForm() {
  const { formik, isLoading, errorMsg } = useFormRegister();
  // cek apakah tombol submit sudah pernah di tekan dan ada error
  const termsError = formik.submitCount > 0 ? formik.errors.acceptTerms : null;
  // prioritaskan error dari API (errorMsg), jika tidak ada tampilkan error validasi Terms
  const displayError = errorMsg || (termsError as string);

  return (
    <div className="grid gap-6">
      {displayError && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {displayError}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Role Field */}
        <div className="space-y-2">
          <Label>I want to sign up as</Label>
          <div className="grid grid-cols-2 gap-4">
            {/* Option 1: Customer */}
            <div
              onClick={() =>
                !isLoading && formik.setFieldValue("role", Role.CUSTOMER)
              }
              className={cn(
                "cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900",
                formik.values.role === Role.CUSTOMER
                  ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <FaUser
                  className={cn(
                    "h-6 w-6",
                    formik.values.role === Role.CUSTOMER
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400"
                  )}
                />
                <div>
                  <p className="font-semibold text-sm">Customer</p>
                  <p className="text-xs text-slate-500">Buy & attend events</p>
                </div>
              </div>
            </div>

            {/* Option 2: Organizer */}
            <div
              onClick={() =>
                !isLoading && formik.setFieldValue("role", Role.ORGANIZER)
              }
              className={cn(
                "cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900",
                formik.values.role === Role.ORGANIZER
                  ? "border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-900"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <FaUsers
                  className={cn(
                    "h-6 w-6",
                    formik.values.role === Role.ORGANIZER
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400"
                  )}
                />
                <div>
                  <p className="font-semibold text-sm">Organizer</p>
                  <p className="text-xs text-slate-500">
                    Create & manage events
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Error Message */}
          {formik.touched.role && formik.errors.role && (
            <p className="text-xs text-red-500 font-medium">
              {formik.errors.role}
            </p>
          )}
        </div>

        {/* Name Field */}
        <FormInput
          name="name"
          label="Full Name"
          placeholder="John Doe"
          formik={formik}
          disabled={isLoading}
        />

        {/* Email Field */}
        <FormInput
          name="email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          formik={formik}
          disabled={isLoading}
        />

        {/* Password Field */}
        <FormInput
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          formik={formik}
          disabled={isLoading}
        />

        {/* Referral Code */}
        <FormInput
          name="referralCode"
          label="Referral Code (Optional)"
          placeholder="REF123"
          formik={formik}
          disabled={isLoading}
        />

        {/* Terms Checkbox */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="terms"
              checked={formik.values.acceptTerms}
              onCheckedChange={(checked) =>
                formik.setFieldValue("acceptTerms", checked)
              }
              className={
                termsError
                  ? "border-red-500 data-[state=unchecked]:border-red-500"
                  : ""
              }
            />
            <label
              htmlFor="terms"
              className={`text-sm font-medium leading-none cursor-pointer ${
                termsError ? "text-red-600" : "text-slate-700"
              }`}
            >
              I agree to the Terms & Conditions
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold cursor-pointer"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      {/* Divider */}
      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">
            Or register with
          </span>
        </div>
      </div> */}

      {/* Social Buttons */}
      {/* <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" disabled={isLoading} className="w-full">
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" disabled={isLoading} className="w-full">
          <FaApple className="mr-2 h-4 w-4" />
          Apple
        </Button>
      </div> */}
    </div>
  );
}

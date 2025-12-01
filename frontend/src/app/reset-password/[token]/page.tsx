"use client";

import AuthLayout from "@/features/auth/components/AuthLayout";
import FormInput from "@/features/auth/components/FormInput";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import { resetPasswordSchema } from "@/features/auth/schemas/authValidationSchema";
import axiosInstance from "@/utils/axiosInstance";
import { useState, Suspense } from "react"; // Suspense dibutuhkan untuk useSearchParams
import { Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

function ResetPasswordForm() {
  const { token } = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      if (!token) {
        setError("Invalid token");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        await axiosInstance.patch(
          "/auth/reset-password",
          {
            newPassword: values.password,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Password reset successful! Please login.");
        router.push("/login");
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to reset password");
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!token) {
    return (
      <div className="text-red-500 text-center">Invalid or missing token.</div>
    );
  }

  return (
    <>
      {error && (
        <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <FormInput
          name="password"
          label="New Password"
          type="password"
          placeholder="••••••••"
          formik={formik}
          disabled={isLoading}
        />
        <FormInput
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          formik={formik}
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="w-full bg-slate-900 text-white"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
      linkText="Back to"
      linkUrl="/login"
      linkLabel="Login"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}

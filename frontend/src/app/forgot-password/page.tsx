"use client";

import AuthLayout from "@/features/auth/components/AuthLayout";
import FormInput from "@/features/auth/components/FormInput";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import { forgotPasswordSchema } from "@/features/auth/schemas/authValidationSchema";
import axiosInstance from "@/utils/axiosInstance";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError("");
      setMessage("");
      try {
        await axiosInstance.post("/auth/forgot-password", values);

        setMessage("Check your email for the reset link!");
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to send email");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
      linkText="Remember your password?"
      linkUrl="/login"
      linkLabel="Log in"
    >
      {message && (
        <div className="p-3 bg-green-100 text-green-600 rounded-md text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <FormInput
          name="email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          formik={formik}
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="w-full bg-slate-900 text-white"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>
    </AuthLayout>
  );
}

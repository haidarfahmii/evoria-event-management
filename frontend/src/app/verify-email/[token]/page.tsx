"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const { token } = useParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verifyToken = async () => {
      try {
        // Kirim token via Header Authorization Bearer
        await axiosInstance.patch(
          "/auth/verify-email",
          {}, // Body kosong
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStatus("success");
        setMessage("Email verified successfully! You can now login.");
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. Token might be expired."
        );
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
            <span>Email Verification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-gray-600">{message}</p>

          {status === "success" && (
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          )}

          {status === "error" && (
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              Back to Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wajib di-wrap Suspense karena menggunakan useSearchParams
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

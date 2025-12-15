import { useFormik } from "formik";
import { loginValidationSchema } from "../schemas/authValidationSchema";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function useFormLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setErrorMsg("");

      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
        toast.error("Login Gagal: " + res.error);
      } else {
        // ambil session terbaru untuk cek role
        const session = await getSession();

        const callbackUrl = searchParams.get("callbackUrl");
        if (callbackUrl) {
          // Jika ada callbackUrl, redirect kesana (untuk user yang dari event detail)
          router.push(decodeURIComponent(callbackUrl));
        } else {
          // Jika tidak ada callbackUrl, gunakan default redirect berdasarkan role
          if (session?.user?.role === "ORGANIZER") {
            router.push("/member/dashboard");
          } else {
            router.push("/");
          }
        }
      }
    },
  });

  return { formik, isLoading, errorMsg };
}

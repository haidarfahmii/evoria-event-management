import { useFormik } from "formik";
import { registerValidationSchema } from "../schemas/authValidationSchema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "../services/auth.service";
import { Role } from "@/@types";

export default function useFormRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: Role.CUSTOMER,
      referralCode: "",
      acceptTerms: false,
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setErrorMsg("");

        // memisahkan accpetTerms dari payload yang dikirim ke backend
        const { acceptTerms, ...payload } = values;
        // kirim data yang dibutuhkan backend (name, email, password, referralCode)
        await authService.register(payload);

        alert("Registration successful! Please login.");
        router.push("/login");
      } catch (error: any) {
        setErrorMsg(error.response?.data?.message || "Registration failed");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return { formik, isLoading, errorMsg };
}

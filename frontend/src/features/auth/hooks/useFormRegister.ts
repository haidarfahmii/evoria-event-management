import { useFormik } from "formik";
import { registerValidationSchema } from "../schemas/authValidationSchema";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function useFormRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      referralCode: "",
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        await axiosInstance.post("/auth/register", values);
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

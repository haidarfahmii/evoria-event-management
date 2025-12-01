import { useFormik } from "formik";
import { loginValidationSchema } from "../schemas/authValidationSchema";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function useFormLogin() {
  const router = useRouter();
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
      } else {
        // ambil session terbaru untuk cek role
        const session = await getSession();

        // cek role dan redirect sesuai hak aksesnya
        if (session?.user?.role === "ORGANIZER") {
          router.push("/member/dashboard");
        } else {
          router.push("/");
        }
      }
    },
  });

  return { formik, isLoading, errorMsg };
}

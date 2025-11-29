import { useFormik } from "formik";
import { changePasswordSchema } from "../schemas/profileValidationSchema";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

export const useChangePasswordForm = () => {
  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await axiosInstance.post("/profile/change-password", {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success("Password changed successfully!");
        resetForm();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to change password"
        );
      }
    },
  });

  return {
    formik,
  };
};

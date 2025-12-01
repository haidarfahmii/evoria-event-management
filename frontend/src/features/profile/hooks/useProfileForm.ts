import { useFormik } from "formik";
import { updateProfileSchema } from "../schemas/profileValidationSchema";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axiosInstance";
import { ProfileData } from "@/@types";
import { useSession } from "next-auth/react";

interface UseProfileFormProps {
  user: ProfileData | null;
  onSuccess: (updatedName: string) => void;
}

// Helper untuk memformat nomor saat inisialisasi (menghapus 62 atau 0 di depan)
const formatPhoneForInput = (phone: string) => {
  if (phone.startsWith("62")) return phone.substring(2);
  if (phone.startsWith("0")) return phone.substring(1);
  return phone;
};

export const useProfileForm = ({ user, onSuccess }: UseProfileFormProps) => {
  const { update } = useSession();

  const formikProfile = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || "",
      phoneNumber: formatPhoneForInput(user?.phoneNumber || ""),
      gender: user?.gender || "",
      birthDate: user?.birthDate
        ? new Date(user.birthDate).toISOString().split("T")[0]
        : "",
    },
    validationSchema: updateProfileSchema,
    onSubmit: async (values) => {
      try {
        // Format ulang nomor hp dengan awalan 62 sebelum dikirim ke backend
        let cleanPhone = values.phoneNumber.trim().replace(/\D/g, "");

        if (cleanPhone.startsWith("0")) {
          cleanPhone = cleanPhone.slice(1);
        }
        // gabungkan dengan kode negara
        const formattedPhone = `62${cleanPhone}`;

        await axiosInstance.patch("/profile", {
          ...values,
          phoneNumber: formattedPhone,
        });

        // update session client
        await update({
          name: values.name,
        });
        toast.success("Profile updated successfully!");

        // Update data lokal agar UI nama langsung berubah
        onSuccess(values.name);

        // Reset form dengan values baru agar tombol kembali disable (dirty = false)
        formikProfile.resetForm({ values });
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      }
    },
  });

  return {
    formikProfile,
  };
};

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

export const useSwitchRole = () => {
  const { update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const switchRole = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const response = await axiosInstance.patch("/auth/switch-role");

      if (response.data.success) {
        const { user, token } = response.data.data;

        await update({
          role: user.role,
          accessToken: token,
        });

        toast.success(
          `Berhasil beralih ke mode ${
            user.role === "ORGANIZER" ? "Organizer" : "Pembeli"
          }`
        );

        const targetUrl = user.role === "ORGANIZER" ? "/member/dashboard" : "/";
        router.push(targetUrl);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Switch role failed:", error);
      toast.error(error.response?.data?.message || "Gagal mengganti role");
    } finally {
      setIsLoading(false);
    }
  };

  return { switchRole, isLoading };
};

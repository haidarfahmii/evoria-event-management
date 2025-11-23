import axiosInstance from "@/utils/axiosInstance";
import { RegisterFormValues, AuthResponse } from "@/@types";

export const authService = {
  async register(data: RegisterFormValues) {
    const response = await axiosInstance.post<AuthResponse>("/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      referralCode: data.referralCode || undefined,
    });
    return response.data;
  },
};

import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// Interceptor Request: Sisipkan token ke header
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: Handle Token Expired (401)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Jika error 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Cek apakah kita sedang di browser (client-side)
      if (typeof window !== "undefined") {
        // Paksa logout NextAuth agar sesi frontend sinkron dengan backend
        await signOut({ callbackUrl: "/login" });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "@/utils/axiosInstance";
import { ProfileData, PointData, CouponData } from "@/@types";

// Import komponen hasil refactoring
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import ProfileSidebar from "./ProfileSidebar";

export default function ProfileContainer() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Management
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [points, setPoints] = useState<PointData | null>(null);
  const [coupons, setCoupons] = useState<CouponData | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, pointsRes, couponsRes] = await Promise.all([
          axiosInstance.get("/profile"),
          axiosInstance.get("/profile/points"),
          axiosInstance.get("/profile/coupons"),
        ]);

        setProfile(profileRes.data.data);
        setPoints(pointsRes.data.data);
        setCoupons(couponsRes.data.data);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        // Jika token expired/tidak ada, redirect ke login
        if (error.response?.status === 401) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  // Handle uplaod avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi size (Client side) - Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size too large (Max 2MB)");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploading(true);
      const res = await axiosInstance.patch("/profile/avatar", formData);

      // Update state profile lokal dengan URL avatar baru dari response
      setProfile((prev: any) => ({
        ...prev,
        avatarUrl: res.data.data.avatarUrl,
      }));

      toast.success("Avatar uploaded successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Handle Update Name (Callback) ---
  const handleUpdateSuccess = (updatedName: string) => {
    setProfile((prev: any) => ({ ...prev, name: updatedName }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 font-medium animate-pulse">
          Loading Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="bottom-right" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Sidebar (Avatar & Rewards) */}
        <div className="space-y-6">
          <ProfileSidebar
            user={profile}
            points={points}
            coupons={coupons}
            isUploading={isUploading}
            onAvatarChange={handleAvatarChange}
            fileInputRef={fileInputRef}
          />
        </div>

        {/* RIGHT COLUMN: Forms (Profile & Password) */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileForm user={profile} onUpdateSuccess={handleUpdateSuccess} />
          {/* card form change password */}
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}

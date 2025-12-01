"use client";

import { PointData, ProfileData, CouponData } from "@/@types";
import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ProfileSidebar from "./ProfileSidebar";

export default function MemberProfileLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [points, setPoints] = useState<PointData | null>(null);
  const [coupons, setCoupons] = useState<CouponData | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, pointsRes, couponsRes] = await Promise.all([
          axiosInstance.get("/profile"),
          axiosInstance.get("/profile/points"),
          axiosInstance.get("/profile/coupons"),
        ]);
        setProfile(profileRes.data.data);
        setPoints(pointsRes.data.data);
        setCoupons(couponsRes.data.data);
      } catch (error) {
        console.error("Error loading profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // handle upload avatar user
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
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar Kiri: Avatar & Rewards */}
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

      {/* Konten Kanan: Form (Informasi Dasar atau Pengaturan) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Kita clone element children untuk pass props 'user' ke form di bawahnya jika perlu */}
        {children}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { toast } from "react-toastify";
import { FiCamera, FiGift, FiCreditCard } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileData, PointData, CouponData } from "@/@types";

interface ProfileSidebarProps {
  user: ProfileData | null;
  points: PointData | null;
  coupons: CouponData | null;
  isUploading: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function ProfileSidebar({
  user,
  points,
  coupons,
  isUploading,
  onAvatarChange,
  fileInputRef,
}: ProfileSidebarProps) {
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(user?.referralCode || "");
    toast.info("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Identity Card */}
      <Card className="shadow-md border-0">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200">
              <Image
                src={
                  user?.avatarUrl ||
                  "https://cdn-icons-png.flaticon.com/512/6858/6858504.png"
                }
                alt="Avatar"
                width={128}
                height={128}
                loading="eager"
                className="object-cover w-full h-full"
              />
            </div>
            {/* Upload Button Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
            >
              <FiCamera size={24} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onAvatarChange}
              hidden
              accept="image/png, image/jpeg, image/jpg, image/webp"
            />
          </div>

          <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
          <p className="text-sm text-slate-500 mb-4">{user?.email}</p>

          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {user?.role}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Card */}
      <Card className="shadow-md border-0 overflow-hidden py-0">
        <CardHeader className="bg-slate-900 text-white py-4">
          <CardTitle className="text-md flex items-center gap-2">
            <FiGift /> My Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-4 space-y-4">
          {/* Points */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                <FiCreditCard />
              </div>
              <div>
                <p className="text-xs text-slate-500">Available Points</p>
                <p className="font-bold text-slate-800">
                  {points?.totalPoints?.toLocaleString() || 0} pts
                </p>
              </div>
            </div>
          </div>

          {/* Coupons */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <FiGift />
              </div>
              <div>
                <p className="text-xs text-slate-500">Active Coupons</p>
                <p className="font-bold text-slate-800">
                  {coupons?.totalCoupons || 0} Coupons
                </p>
              </div>
            </div>
          </div>

          {/* Referral Code */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 mb-1">Your Referral Code</p>
            <div
              className="bg-slate-100 p-2 rounded-md font-mono text-lg font-bold tracking-widest border border-dashed border-slate-300 cursor-pointer hover:bg-slate-200 transition"
              onClick={handleCopyReferral}
            >
              {user?.referralCode || "Loading..."}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Share this code to earn 10,000 points!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import ProfileForm from "@/features/profile/components/ProfileForm";
import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState } from "react";
export default function InformasiDasarPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // fetch data profile khusus form ini
    axiosInstance.get("/profile").then((res) => {
      setUser(res.data.data);
    });
  }, []);

  return (
    <ProfileForm
      user={user}
      onUpdateSuccess={(name) => setUser((prev: any) => ({ ...prev, name }))}
    />
  );
}

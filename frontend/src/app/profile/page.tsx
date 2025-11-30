import { Metadata } from "next";
import ProfileContainer from "@/features/profile/components/ProfileContainer";
import SidebarLayout from "@/components/SidebarLayout";

export const metadata: Metadata = {
  title: "My Profile - Evoria Event Management",
  description:
    "Manage your personal information, rewards, and security settings.",
};

export default function ProfilePage() {
  return (
    <SidebarLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Informasi Pribadi
        </h1>
        <hr className="mb-2 border" />
      </div>
      <ProfileContainer />
    </SidebarLayout>
  );
}

import { Metadata } from "next";
import ProfileContainer from "@/features/profile/components/ProfileContainer";

export const metadata: Metadata = {
  title: "My Profile - Evoria Event Management",
  description:
    "Manage your personal information, rewards, and security settings.",
};

export default function ProfilePage() {
  return (
    <main>
      <ProfileContainer />
    </main>
  );
}

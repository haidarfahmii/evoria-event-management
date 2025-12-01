import MemberProfileLayoutWrapper from "@/features/profile/components/MemberProfileLayoutWrapper";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
      <MemberProfileLayoutWrapper>{children}</MemberProfileLayoutWrapper>
    </div>
  );
}

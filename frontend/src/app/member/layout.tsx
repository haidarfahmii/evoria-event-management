import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BreadcrumbProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}

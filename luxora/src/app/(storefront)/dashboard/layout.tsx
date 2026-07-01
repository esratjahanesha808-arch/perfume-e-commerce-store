import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { PageSection } from "@/components/shared/PageSection";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { getDashboardSidebarStats } from "@/services/dashboard.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const stats = await getDashboardSidebarStats(session.user.id);

  return (
    <div className="dashboard-page w-full min-w-0">
      <PageSection className="dashboard-page-section">
        <SiteContainer>
          <div className="dashboard-shell">
            <DashboardSidebar stats={stats} />
            <div className="dashboard-main min-w-0">{children}</div>
          </div>
        </SiteContainer>
      </PageSection>
    </div>
  );
}

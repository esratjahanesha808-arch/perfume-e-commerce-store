import Link from "next/link";

interface DashboardPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function DashboardPageHeader({ title, subtitle, action }: DashboardPageHeaderProps) {
  return (
    <header className="dashboard-page-header">
      <div className="min-w-0">
        <h1 className="dashboard-page-title">{title}</h1>
        {subtitle && <p className="dashboard-page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function DashboardWelcomeHeader({
  name,
  tierName,
  loyaltyPoints,
}: {
  name: string;
  tierName: string;
  loyaltyPoints: number;
}) {
  return (
    <header className="dashboard-welcome-header">
      <div className="min-w-0">
        <h1 className="dashboard-welcome-title">Welcome back, {name.split(" ")[0]}!</h1>
        <p className="dashboard-welcome-subtitle">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>
      <div className="dashboard-welcome-tier-card">
        <span className="dashboard-welcome-tier-label">{tierName}</span>
        <p className="dashboard-welcome-tier-points">
          {loyaltyPoints.toLocaleString()} points
        </p>
        <Link href="/dashboard/loyalty" className="dashboard-welcome-tier-link">
          View Benefits
        </Link>
      </div>
    </header>
  );
}

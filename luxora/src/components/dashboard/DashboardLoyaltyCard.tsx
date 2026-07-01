import Link from "next/link";
import { Crown } from "lucide-react";
import { LOYALTY_BENEFITS } from "@/lib/loyalty";

interface DashboardLoyaltyCardProps {
  tierName: string;
  points: number;
  target: number;
  progressPercent: number;
  pointsToNext: number;
  nextTierName: string | null;
}

export function DashboardLoyaltyCard({
  tierName,
  points,
  target,
  progressPercent,
  pointsToNext,
  nextTierName,
}: DashboardLoyaltyCardProps) {
  return (
    <section className="dashboard-panel dashboard-panel--cream dashboard-loyalty-card">
      <div className="dashboard-panel-toolbar">
        <div>
          <h2 className="dashboard-panel-title">Loyalty Progress</h2>
          <p className="dashboard-panel-subtitle">Your member tier and rewards</p>
        </div>
      </div>

      <div className="dashboard-loyalty-inner">
        <div className="dashboard-loyalty-head">
          <span className="dashboard-loyalty-tier-badge">
            <Crown size={14} aria-hidden="true" />
            {tierName}
          </span>
        </div>

        {nextTierName ? (
          <>
            <p className="dashboard-loyalty-progress-label">
              {points.toLocaleString()} / {target.toLocaleString()} points to {nextTierName}
            </p>
            <div className="dashboard-loyalty-progress-track" aria-hidden="true">
              <span
                className="dashboard-loyalty-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="dashboard-loyalty-points-left">
              {pointsToNext.toLocaleString()} points to go
            </p>
          </>
        ) : (
          <p className="dashboard-loyalty-progress-label">
            You&apos;ve reached our highest tier — enjoy exclusive Platinum benefits.
          </p>
        )}

        <ul className="dashboard-loyalty-benefits">
          {LOYALTY_BENEFITS.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </div>

      <Link href="/dashboard/loyalty" className="dashboard-loyalty-btn">
        View All Benefits
      </Link>
    </section>
  );
}

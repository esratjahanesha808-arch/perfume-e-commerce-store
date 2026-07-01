import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Crown } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDashboardOverview } from "@/services/dashboard.service";
import { LOYALTY_BENEFITS, LOYALTY_TIERS } from "@/lib/loyalty";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardLoyaltyCard } from "@/components/dashboard/DashboardLoyaltyCard";

export const metadata: Metadata = {
  title: "Loyalty Points — Luxora",
};

export const dynamic = "force-dynamic";

export default async function DashboardLoyaltyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardOverview(session.user.id);

  return (
    <>
      <DashboardPageHeader
        title="Loyalty Points"
        subtitle="Earn 2 points for every $1 spent on qualifying orders."
      />

      <div className="dashboard-loyalty-page-grid">
        <DashboardLoyaltyCard
          tierName={data.loyalty.tier.name}
          points={data.loyalty.current}
          target={data.loyalty.target}
          progressPercent={data.loyalty.progressPercent}
          pointsToNext={data.loyalty.pointsToNext}
          nextTierName={data.loyalty.tier.nextTierName}
        />

        <section className="dashboard-panel">
          <h2 className="dashboard-panel-title">Your Points Balance</h2>
          <p className="dashboard-loyalty-balance">{data.stats.loyaltyPoints.toLocaleString()}</p>
          <p className="dashboard-panel-subtitle">
            Total lifetime spend: ${data.stats.totalSpent.toFixed(2)}
          </p>
          <Link href="/shop" className="dashboard-primary-btn dashboard-loyalty-shop-btn">
            Earn More Points
          </Link>
        </section>
      </div>

      <section className="dashboard-panel dashboard-tier-guide">
        <h2 className="dashboard-panel-title">Membership Tiers</h2>
        <ul className="dashboard-tier-list">
          {LOYALTY_TIERS.map((tier) => (
            <li
              key={tier.id}
              className={`dashboard-tier-item${data.loyalty.tier.id === tier.id ? " is-current" : ""}`}
            >
              <Crown size={16} aria-hidden="true" />
              <div>
                <p className="dashboard-tier-name">{tier.name}</p>
                <p className="dashboard-tier-threshold">
                  {tier.minPoints.toLocaleString()}+ points
                </p>
              </div>
            </li>
          ))}
        </ul>
        <ul className="dashboard-loyalty-benefits dashboard-loyalty-benefits-page">
          {LOYALTY_BENEFITS.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

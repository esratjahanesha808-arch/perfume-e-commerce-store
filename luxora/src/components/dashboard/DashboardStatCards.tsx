"use client";

import Link from "next/link";
import { Package, Sparkles, Heart, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DashboardStatCardsProps {
  totalOrders: number;
  loyaltyPoints: number;
  wishlistCount: number;
  totalSpent: number;
}

const CARDS = [
  {
    key: "orders",
    label: "Total Orders",
    icon: Package,
    href: "/dashboard/orders",
    linkLabel: "View all orders",
  },
  {
    key: "loyalty",
    label: "Loyalty Points",
    icon: Sparkles,
    href: "/dashboard/loyalty",
    linkLabel: "Redeem points",
  },
  {
    key: "wishlist",
    label: "Wishlist Items",
    icon: Heart,
    href: "/dashboard/wishlist",
    linkLabel: "View wishlist",
  },
  {
    key: "spent",
    label: "Total Spent",
    icon: Wallet,
    href: "/dashboard/orders",
    linkLabel: "View spending",
  },
] as const;

export function DashboardStatCards({
  totalOrders,
  loyaltyPoints,
  wishlistCount,
  totalSpent,
}: DashboardStatCardsProps) {
  const values = {
    orders: String(totalOrders),
    loyalty: loyaltyPoints.toLocaleString(),
    wishlist: String(wishlistCount),
    spent: formatPrice(totalSpent),
  };

  return (
    <div className="dashboard-stat-grid">
      {CARDS.map(({ key, label, icon: Icon, href, linkLabel }) => (
        <article key={key} className="dashboard-stat-card">
          <div className="dashboard-stat-card-top">
            <span className="dashboard-stat-icon-wrap">
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="dashboard-stat-label">{label}</p>
          </div>
          <p className="dashboard-stat-value">{values[key]}</p>
          <Link href={href} className="dashboard-stat-link">
            {linkLabel}
          </Link>
        </article>
      ))}
    </div>
  );
}

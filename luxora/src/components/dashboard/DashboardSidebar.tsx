"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Crown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Sparkles,
  User,
} from "lucide-react";

export type DashboardSidebarStats = {
  name: string;
  email: string;
  initials: string;
  tierName: string;
  wishlistCount: number;
  reviewCount: number;
  orderCount: number;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart, countKey: "wishlistCount" as const },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/profile", label: "Account Details", icon: User },
  { href: "/dashboard/payment-methods", label: "Payment Methods", icon: CreditCard },
  { href: "/dashboard/reviews", label: "My Reviews", icon: MessageSquare, countKey: "reviewCount" as const },
  { href: "/dashboard/loyalty", label: "Loyalty Points", icon: Sparkles },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

interface DashboardSidebarProps {
  stats: DashboardSidebarStats;
}

export function DashboardSidebar({ stats }: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-profile">
        <div className="dashboard-sidebar-avatar" aria-hidden="true">
          {stats.initials}
        </div>
        <div className="dashboard-sidebar-user min-w-0">
          <p className="dashboard-sidebar-name">{stats.name}</p>
          <p className="dashboard-sidebar-email">{stats.email}</p>
        </div>
        <span className="dashboard-sidebar-tier">
          <Crown size={12} aria-hidden="true" />
          {stats.tierName}
        </span>
      </div>

      <nav className="dashboard-sidebar-nav" aria-label="Account navigation">
        <ul className="dashboard-sidebar-nav-list">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact, countKey }) => {
            const active = isActive(href, exact);
            const badgeCount = countKey ? stats[countKey] : 0;

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`dashboard-sidebar-link${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span>{label}</span>
                  {badgeCount > 0 && (
                    <span className="dashboard-sidebar-badge">{badgeCount}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="dashboard-sidebar-help">
        <p className="dashboard-sidebar-help-title">Need Help?</p>
        <p className="dashboard-sidebar-help-text">
          Our concierge team is here for order support and fragrance guidance.
        </p>
        <Link href="/help" className="dashboard-sidebar-help-btn">
          Contact Support
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <button
        type="button"
        className="dashboard-sidebar-logout"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
        Logout
      </button>
    </aside>
  );
}

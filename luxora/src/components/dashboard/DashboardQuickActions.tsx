import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CreditCard,
  MapPin,
  MessageSquare,
  User,
} from "lucide-react";

const ACTIONS = [
  {
    href: "/dashboard/profile",
    label: "Update Account Details",
    icon: User,
  },
  {
    href: "/dashboard/addresses",
    label: "Manage Addresses",
    icon: MapPin,
  },
  {
    href: "/dashboard/payment-methods",
    label: "Payment Methods",
    icon: CreditCard,
  },
  {
    href: "/dashboard/reviews",
    label: "My Reviews",
    icon: MessageSquare,
  },
  {
    href: "/dashboard/notifications",
    label: "Notification Settings",
    icon: Bell,
  },
] as const;

export function DashboardQuickActions() {
  return (
    <section className="dashboard-panel dashboard-quick-actions">
      <h2 className="dashboard-panel-title">Quick Actions</h2>
      <ul className="dashboard-quick-list">
        {ACTIONS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="dashboard-quick-link">
              <span className="dashboard-quick-link-left">
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                {label}
              </span>
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

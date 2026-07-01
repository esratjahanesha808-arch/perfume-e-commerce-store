"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Tag,
  Users,
  Layers,
  Award,
  FolderTree,
  Ticket,
  Image,
  Mail,
  MessageSquare,
  FileText,
  Shield,
  Cog,
  Store,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NavSection = {
  title?: string;
  items: NavLink[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Store Management",
    items: [
      { href: "/admin/orders", label: "Orders", icon: Package },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
      { href: "/admin/products", label: "Products", icon: ShoppingBag },
      { href: "/admin/collections", label: "Collections", icon: Layers },
      { href: "/admin/brands", label: "Brands", icon: Award },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
      { href: "/admin/marketing/banners", label: "Banners", icon: Image },
      { href: "/admin/marketing/subscribers", label: "Subscribers", icon: Mail },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
    ],
  },
  {
    title: "Reports",
    items: [
      { href: "/admin/reports/sales", label: "Sales Report", icon: BarChart3 },
      { href: "/admin/reports/products", label: "Products Report", icon: FileText },
      { href: "/admin/reports/customers", label: "Customers Report", icon: Users },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/admin/settings", label: "Store Settings", icon: Store },
      { href: "/admin/settings/users", label: "User Management", icon: Users },
      { href: "/admin/settings/roles", label: "Roles & Permissions", icon: Shield },
      { href: "/admin/settings/system", label: "System Settings", icon: Cog },
    ],
  },
];

export type AdminSidebarUser = {
  name: string;
  email: string;
  initials: string;
};

interface AdminSidebarProps {
  user: AdminSidebarUser;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ user, mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}

      <aside
        className={`admin-sidebar${mobileOpen ? " is-open" : ""}`}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-brand">
          <Link href="/admin" className="admin-sidebar-logo" onClick={onClose}>
            <span className="admin-sidebar-logo-mark" aria-hidden="true">
              <Tag size={18} strokeWidth={1.75} />
            </span>
            <span className="admin-sidebar-logo-text">
              <span className="admin-sidebar-logo-name">LUXORA</span>
              <span className="admin-sidebar-logo-tagline">Scent of Luxury</span>
            </span>
          </Link>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_SECTIONS.map((section, sectionIndex) => (
            <div key={section.title ?? `section-${sectionIndex}`} className="admin-sidebar-section">
              {section.title && (
                <p className="admin-sidebar-section-title">{section.title}</p>
              )}
              <ul className="admin-sidebar-nav-list">
                {section.items.map(({ href, label, icon: Icon, exact }) => {
                  const active = isActive(href, exact);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`admin-sidebar-link${active ? " is-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                        onClick={onClose}
                      >
                        <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                        <span>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar" aria-hidden="true">
              {user.initials}
            </div>
            <div className="admin-sidebar-user-info min-w-0">
              <p className="admin-sidebar-user-name">{user.name}</p>
              <p className="admin-sidebar-user-email">{user.email}</p>
            </div>
            <ChevronDown size={14} className="admin-sidebar-user-chevron" aria-hidden="true" />
          </div>

          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export function getAdminPageTitle(pathname: string): string {
  if (/^\/admin\/orders\/[^/]+$/.test(pathname)) {
    return "Order Detail";
  }

  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.exact && pathname === item.href) return item.label;
      if (!item.exact && (pathname === item.href || pathname.startsWith(`${item.href}/`))) {
        return item.label;
      }
    }
  }
  return "Dashboard";
}

export { NAV_SECTIONS };

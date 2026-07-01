"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, Calendar, ExternalLink, Menu } from "lucide-react";
import { getAdminPageTitle } from "./AdminSidebar";
import { useCallback, useMemo, useState } from "react";

interface AdminTopbarProps {
  notificationCount: number;
  onMenuToggle?: () => void;
}

function formatDateRangeLabel(from: string, to: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${fmt.format(new Date(from))} – ${fmt.format(new Date(to))}`;
}

export function AdminTopbar({ notificationCount, onMenuToggle }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = getAdminPageTitle(pathname);

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const defaultRange = useMemo(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }, []);

  const [rangeOpen, setRangeOpen] = useState(false);
  const from = fromParam ?? defaultRange.from;
  const to = toParam ?? defaultRange.to;

  const applyPreset = useCallback(
    (days: number) => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - (days - 1));
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", start.toISOString().slice(0, 10));
      params.set("to", end.toISOString().slice(0, 10));
      router.push(`${pathname}?${params.toString()}`);
      setRangeOpen(false);
    },
    [pathname, router, searchParams]
  );

  const showDatePicker = pathname === "/admin";

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-topbar-menu-btn"
          aria-label="Open navigation menu"
          onClick={onMenuToggle}
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <h1 className="admin-topbar-title">{title}</h1>
      </div>

      <div className="admin-topbar-actions">
        <Link
          href="/"
          className="admin-topbar-view-store"
          target="_blank"
          rel="noopener noreferrer"
          title="Open the customer storefront in a new tab"
        >
          <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
          Preview Storefront
        </Link>

        <button type="button" className="admin-topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} strokeWidth={1.75} />
          {notificationCount > 0 && (
            <span className="admin-topbar-badge">{notificationCount}</span>
          )}
        </button>

        {showDatePicker && (
          <div className="admin-date-picker">
            <button
              type="button"
              className="admin-date-picker-trigger"
              aria-expanded={rangeOpen}
              onClick={() => setRangeOpen((open) => !open)}
            >
              <Calendar size={15} strokeWidth={1.75} aria-hidden="true" />
              <span>{formatDateRangeLabel(from, to)}</span>
            </button>

            {rangeOpen && (
              <>
                <button
                  type="button"
                  className="admin-date-picker-backdrop"
                  aria-label="Close date picker"
                  onClick={() => setRangeOpen(false)}
                />
                <div className="admin-date-picker-menu">
                  <button type="button" onClick={() => applyPreset(7)}>
                    Last 7 days
                  </button>
                  <button type="button" onClick={() => applyPreset(14)}>
                    Last 14 days
                  </button>
                  <button type="button" onClick={() => applyPreset(30)}>
                    Last 30 days
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

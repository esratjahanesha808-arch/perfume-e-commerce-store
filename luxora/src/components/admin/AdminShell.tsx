"use client";

import { useState } from "react";
import { AdminSidebar, type AdminSidebarUser } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminDemoBanner } from "./AdminDemoBanner";

interface AdminShellProps {
  user: AdminSidebarUser;
  notificationCount: number;
  isDemo?: boolean;
  children: React.ReactNode;
}

export function AdminShell({ user, notificationCount, isDemo, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar
        user={user}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="admin-main">
        <AdminTopbar
          notificationCount={notificationCount}
          onMenuToggle={() => setMobileOpen(true)}
        />
        {isDemo && <AdminDemoBanner />}
        <div className="admin-content">{children}</div>
        <footer className="admin-footer">
          <p>© {new Date().getFullYear()} Luxora. All rights reserved.</p>
          <p className="admin-footer-version">Version 1.0.0</p>
        </footer>
      </div>
    </div>
  );
}

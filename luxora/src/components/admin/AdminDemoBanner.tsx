"use client";

import { AlertTriangle } from "lucide-react";

/**
 * Shown inside the admin layout when the logged-in user is a demo admin.
 * Demo admins can browse everything but cannot save changes.
 */
export function AdminDemoBanner() {
  return (
    <div className="admin-demo-banner" role="alert" aria-live="polite">
      <AlertTriangle size={16} strokeWidth={2} className="admin-demo-banner-icon" aria-hidden="true" />
      <span className="admin-demo-banner-text">
        <strong>Demo Mode</strong> — You are logged in as a demo admin. All changes are blocked and will not be saved.
      </span>
    </div>
  );
}

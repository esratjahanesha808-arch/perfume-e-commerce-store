"use client";

import { useState } from "react";
import { toast } from "sonner";

interface PasswordFormProps {
  hasPassword: boolean;
}

export function PasswordForm({ hasPassword }: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!hasPassword) {
    return (
      <div className="dashboard-panel">
        <h2 className="dashboard-panel-title">Password</h2>
        <p className="dashboard-panel-subtitle">
          You signed in with Google. Password changes are managed through your Google account.
        </p>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not change password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch {
      toast.error("Could not change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-panel">
      <header className="dashboard-panel-header">
        <div>
          <h2 className="dashboard-panel-title">Change Password</h2>
          <p className="dashboard-panel-subtitle">
            Use at least 8 characters with one uppercase letter and one number.
          </p>
        </div>
      </header>

      <form className="dashboard-form" onSubmit={(e) => void handleSubmit(e)}>
        <div className="dashboard-field">
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="dashboard-field">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="dashboard-field">
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="dashboard-primary-btn" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}

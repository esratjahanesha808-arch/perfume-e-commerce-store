"use client";

import { useState } from "react";
import { toast } from "sonner";

type ProfileData = {
  email: string;
  name: string;
  phone: string;
  hasPassword: boolean;
  memberSince: string;
};

interface ProfileFormProps {
  initialProfile: ProfileData;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [name, setName] = useState(initialProfile.name);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not update profile.");
        return;
      }

      toast.success("Profile updated.");
    } catch {
      toast.error("Could not update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-panel">
      <header className="dashboard-panel-header">
        <div>
          <h2 className="dashboard-panel-title">Profile Information</h2>
          <p className="dashboard-panel-subtitle">
            Member since {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(initialProfile.memberSince))}
          </p>
        </div>
      </header>

      <form className="dashboard-form" onSubmit={(e) => void handleSubmit(e)}>
        <div className="dashboard-field">
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" type="email" value={initialProfile.email} disabled />
          <p className="dashboard-field-hint">Email cannot be changed here.</p>
        </div>

        <div className="dashboard-field">
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="dashboard-field">
          <label htmlFor="profile-phone">Phone</label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <button type="submit" className="dashboard-primary-btn" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefsInput,
} from "@/lib/validations/user";

export function NotificationPreferencesForm() {
  const [prefs, setPrefs] = useState<NotificationPrefsInput>(DEFAULT_NOTIFICATION_PREFS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPrefs() {
      try {
        const res = await fetch("/api/v1/users/notifications");
        if (!res.ok) throw new Error("Failed to load");

        const json = (await res.json()) as { data: NotificationPrefsInput };
        if (!cancelled) setPrefs(json.data);
      } catch {
        if (!cancelled) {
          toast.error("Could not load notification preferences.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadPrefs();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = (key: keyof NotificationPrefsInput) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/users/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      if (!res.ok) throw new Error("Failed to save");

      const json = (await res.json()) as { data: NotificationPrefsInput };
      setPrefs(json.data);
      toast.success("Notification preferences saved.");
    } catch {
      toast.error("Could not save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const items: { key: keyof NotificationPrefsInput; label: string; description: string }[] = [
    {
      key: "orderUpdates",
      label: "Order updates",
      description: "Shipping confirmations, delivery alerts, and order status changes.",
    },
    {
      key: "promotions",
      label: "Promotions & offers",
      description: "Exclusive discounts and member-only sales.",
    },
    {
      key: "newArrivals",
      label: "New arrivals",
      description: "Be first to discover newly added fragrances.",
    },
    {
      key: "loyaltyRewards",
      label: "Loyalty rewards",
      description: "Points milestones, tier upgrades, and redemption reminders.",
    },
  ];

  if (isLoading) {
    return (
      <div className="dashboard-panel">
        <div className="dashboard-loading-block" aria-hidden />
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <ul className="dashboard-notification-list">
        {items.map(({ key, label, description }) => (
          <li key={key} className="dashboard-notification-item">
            <div>
              <p className="dashboard-notification-label">{label}</p>
              <p className="dashboard-notification-desc">{description}</p>
            </div>
            <label className="dashboard-toggle">
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => handleToggle(key)}
              />
              <span className="dashboard-toggle-ui" aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="dashboard-primary-btn"
        onClick={() => void handleSave()}
        disabled={isSaving}
      >
        {isSaving ? "Saving…" : "Save Preferences"}
      </button>
    </div>
  );
}

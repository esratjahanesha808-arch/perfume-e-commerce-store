import { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { NotificationPreferencesForm } from "@/components/dashboard/NotificationPreferencesForm";

export const metadata: Metadata = {
  title: "Notifications — Luxora",
};

export default function DashboardNotificationsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Notifications"
        subtitle="Choose what updates you'd like to receive."
      />
      <NotificationPreferencesForm />
    </>
  );
}

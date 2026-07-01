import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/services/user.service";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { PasswordForm } from "@/components/dashboard/PasswordForm";

export const metadata: Metadata = {
  title: "Account Settings — Luxora",
};

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getUserProfile(session.user.id);

  return (
    <>
      <DashboardPageHeader
        title="Settings"
        subtitle="Manage your password and account security."
      />
      <PasswordForm hasPassword={profile.hasPassword} />
    </>
  );
}

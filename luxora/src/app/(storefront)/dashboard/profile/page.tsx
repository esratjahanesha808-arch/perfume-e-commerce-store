import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/services/user.service";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const metadata: Metadata = {
  title: "Account Details — Luxora",
};

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getUserProfile(session.user.id);

  return (
    <>
      <DashboardPageHeader
        title="Account Details"
        subtitle="Update your personal information and contact details."
      />
      <ProfileForm
        initialProfile={{
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          hasPassword: profile.hasPassword,
          memberSince: profile.memberSince.toISOString(),
        }}
      />
    </>
  );
}

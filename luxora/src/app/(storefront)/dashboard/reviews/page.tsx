import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserReviewsForDashboard } from "@/services/dashboard.service";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardReviewsList } from "@/components/dashboard/DashboardReviewsList";

export const metadata: Metadata = {
  title: "My Reviews — Luxora",
};

export const dynamic = "force-dynamic";

export default async function DashboardReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reviews = await getUserReviewsForDashboard(session.user.id);

  return (
    <>
      <DashboardPageHeader
        title="My Reviews"
        subtitle="Reviews you've shared for fragrances in your collection."
      />
      <DashboardReviewsList reviews={reviews} />
    </>
  );
}

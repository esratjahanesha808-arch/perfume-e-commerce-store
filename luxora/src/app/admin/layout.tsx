import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getInitials } from "@/lib/loyalty";
import { isUserDemo } from "@/lib/demo";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSidebarMeta } from "@/services/admin.service";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const [meta, isDemo] = await Promise.all([
    getAdminSidebarMeta(),
    isUserDemo(session.user.id),
  ]);

  const user = {
    name: session.user.name || "Admin User",
    email: session.user.email || "",
    initials: getInitials(session.user.name || "Admin", session.user.email || "admin"),
  };

  return (
    <Suspense fallback={<div className="admin-layout admin-layout-loading" />}>
      <AdminShell user={user} notificationCount={meta.notificationCount} isDemo={isDemo}>
        {children}
      </AdminShell>
    </Suspense>
  );
}

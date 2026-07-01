import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/services/order.service";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { OrderHistory } from "@/components/dashboard/OrderHistory";

export const metadata: Metadata = {
  title: "My Orders — Luxora",
};

export const dynamic = "force-dynamic";

type OrdersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function DashboardOrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const data = await getUserOrders(session.user.id, page);

  return (
    <>
      <DashboardPageHeader
        title="Orders"
        subtitle="Track deliveries, view receipts, and reorder your favorites."
      />
      <OrderHistory
        orders={data.orders.map((order) => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
        }))}
        page={data.page}
        totalPages={data.totalPages}
      />
    </>
  );
}

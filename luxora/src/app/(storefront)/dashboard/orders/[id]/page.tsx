import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserOrderById } from "@/services/order.service";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { OrderDetail } from "@/components/dashboard/OrderDetail";

export const metadata: Metadata = {
  title: "Order Details — Luxora",
};

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DashboardOrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const order = await getUserOrderById(session.user.id, id);

  if (!order) notFound();

  return (
    <>
      <DashboardPageHeader title="Order Details" subtitle={order.orderNumber} />
      <OrderDetail
        order={{
          ...order,
          createdAt: order.createdAt.toISOString(),
          shippedAt: order.shippedAt?.toISOString() ?? null,
          deliveredAt: order.deliveredAt?.toISOString() ?? null,
          payment: order.payment
            ? {
                ...order.payment,
                createdAt: order.payment.createdAt.toISOString(),
              }
            : null,
        }}
      />
    </>
  );
}

import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/services/order.service";
import { AdminOrderDetailClient } from "@/components/admin/AdminOrderDetailClient";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return <AdminOrderDetailClient order={order} />;
}

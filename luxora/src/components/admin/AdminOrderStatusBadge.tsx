import type { OrderStatus } from "@prisma/client";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

interface AdminOrderStatusBadgeProps {
  status: OrderStatus;
}

export function AdminOrderStatusBadge({ status }: AdminOrderStatusBadgeProps) {
  const label = STATUS_LABELS[status];
  const tone =
    status === "DELIVERED" || status === "CONFIRMED"
      ? "completed"
      : status === "PROCESSING" || status === "PENDING"
        ? "processing"
        : status === "SHIPPED"
          ? "shipped"
          : "cancelled";

  return (
    <span className={`admin-status-badge admin-status-${tone}`}>{label}</span>
  );
}

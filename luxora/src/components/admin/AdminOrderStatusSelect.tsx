"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";
import { AdminOrderStatusBadge } from "./AdminOrderStatusBadge";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

interface AdminOrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function AdminOrderStatusSelect({
  orderId,
  currentStatus,
}: AdminOrderStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleChange = (nextStatus: OrderStatus) => {
    setStatus(nextStatus);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setStatus(currentStatus);
          toast.error(payload?.error?.message ?? "Failed to update order status");
          return;
        }

        const updatedStatus = (payload?.status ?? nextStatus) as OrderStatus;
        setStatus(updatedStatus);
        toast.success(`Order updated to ${updatedStatus.toLowerCase()}`);
        router.refresh();
      } catch {
        setStatus(currentStatus);
        toast.error("Failed to update order status");
      }
    });
  };

  return (
    <div className="admin-order-status-cell">
      <AdminOrderStatusBadge status={status} />
      <select
        className="admin-table-status-select"
        value={status}
        disabled={isPending}
        aria-label="Update order status"
        onChange={(event) => handleChange(event.target.value as OrderStatus)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0) + option.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

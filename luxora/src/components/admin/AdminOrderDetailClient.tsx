"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { AdminOrderStatusBadge } from "./AdminOrderStatusBadge";
import { formatOrderDate } from "@/components/dashboard/OrderStatusBadge";

export type AdminOrderDetailData = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    id: string;
    productId: string;
    productName: string;
    productPrice: number;
    productImage: string | null;
    quantity: number;
    subtotal: number;
  }[];
  address: {
    fullName: string;
    phone: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
  };
  payment: {
    status: PaymentStatus;
    paymentMethod: string | null;
    receiptUrl: string | null;
    createdAt: string;
    refundAmount: number;
  } | null;
};

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

interface AdminOrderDetailClientProps {
  order: AdminOrderDetailData;
}

export function AdminOrderDetailClient({ order: initialOrder }: AdminOrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState<OrderStatus>(initialOrder.status);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/v1/admin/orders/${order.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, note: note.trim() || undefined }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          toast.error(payload?.error?.message ?? "Failed to update order status");
          return;
        }

        if (payload?.status) {
          setOrder(payload);
          setStatus(payload.status);
        }
        toast.success(`Order updated to ${status.toLowerCase()}`);
        router.refresh();
      } catch {
        toast.error("Failed to update order status");
      }
    });
  };

  return (
    <div className="admin-order-detail">
      <Link href="/admin/orders" className="admin-back-link">
        <ArrowLeft size={14} strokeWidth={1.75} />
        Back to Orders
      </Link>

      <div className="admin-detail-grid">
        <section className="admin-card admin-detail-main">
          <header className="admin-card-header">
            <div>
              <h2 className="admin-card-title">{order.orderNumber}</h2>
              <p className="admin-card-subtitle">
                Placed {formatOrderDate(order.createdAt)}
              </p>
            </div>
            <AdminOrderStatusBadge status={order.status} />
          </header>

          <ul className="admin-line-items">
            {order.items.map((item) => {
              const imageUrl = resolveProductImageUrl(
                item.productImage,
                item.productName,
                item.productName
              );

              return (
                <li key={item.id} className="admin-line-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="" className="admin-line-item-image" />
                  <div className="admin-line-item-info min-w-0">
                    <p className="admin-line-item-name">{item.productName}</p>
                    <p className="admin-line-item-meta">
                      Qty {item.quantity} · {formatPrice(item.productPrice)} each
                    </p>
                  </div>
                  <p className="admin-line-item-total">{formatPrice(item.subtotal)}</p>
                </li>
              );
            })}
          </ul>

          <dl className="admin-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>-{formatPrice(order.discountAmount)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{formatPrice(order.shippingCost)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>{formatPrice(order.taxAmount)}</dd>
            </div>
            <div className="admin-totals-grand">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <aside className="admin-detail-stack">
          <section className="admin-card">
            <h3 className="admin-card-title">Update Status</h3>
            <p className="admin-card-subtitle">Customer receives an email on change</p>

            <div className="admin-form-stack">
              <label className="admin-field">
                <span>Status</span>
                <select
                  className="admin-table-status-select"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as OrderStatus)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0) + option.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span>Internal note (optional)</span>
                <textarea
                  rows={3}
                  value={note}
                  placeholder="Fulfillment notes…"
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={isPending || status === order.status}
                onClick={handleStatusUpdate}
              >
                {isPending ? "Saving…" : "Save Status"}
              </button>
            </div>
          </section>

          <section className="admin-card">
            <h3 className="admin-card-title">Customer</h3>
            <p className="admin-detail-text">{order.customer.name}</p>
            <p className="admin-detail-muted">{order.customer.email}</p>
          </section>

          <section className="admin-card">
            <h3 className="admin-card-title">Shipping Address</h3>
            <address className="admin-detail-address">
              {order.address.fullName}
              <br />
              {order.address.addressLine1}
              {order.address.addressLine2 ? (
                <>
                  <br />
                  {order.address.addressLine2}
                </>
              ) : null}
              <br />
              {order.address.city}
              {order.address.state ? `, ${order.address.state}` : ""}{" "}
              {order.address.postalCode}
              <br />
              {order.address.country}
            </address>
          </section>

          {order.payment && (
            <section className="admin-card">
              <h3 className="admin-card-title">Payment</h3>
              <p className="admin-detail-text">{order.payment.status}</p>
              {order.payment.paymentMethod && (
                <p className="admin-detail-muted">{order.payment.paymentMethod}</p>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

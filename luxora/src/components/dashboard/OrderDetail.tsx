import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge, formatOrderDate } from "./OrderStatusBadge";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export type DashboardOrderDetail = {
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
  items: {
    id: string;
    productName: string;
    productPrice: number;
    productImage: string | null;
    quantity: number;
    subtotal: number;
    productSlug: string;
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
  } | null;
};

interface OrderDetailProps {
  order: DashboardOrderDetail;
}

const TIMELINE_STEPS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

function getTimelineIndex(status: OrderStatus) {
  if (status === "CANCELLED" || status === "REFUNDED") return -1;
  return TIMELINE_STEPS.indexOf(status);
}

export function OrderDetail({ order }: OrderDetailProps) {
  const activeIndex = getTimelineIndex(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const showReviewActions = order.status === "DELIVERED";

  return (
    <div className="dashboard-order-detail">
      <Link href="/dashboard/orders" className="dashboard-back-link">
        <ArrowLeft size={14} strokeWidth={1.75} />
        Back to Orders
      </Link>

      <div className="dashboard-detail-grid">
        <section className="dashboard-panel">
          <header className="dashboard-panel-header">
            <div>
              <h2 className="dashboard-panel-title">{order.orderNumber}</h2>
              <p className="dashboard-panel-subtitle">
                Placed {formatOrderDate(order.createdAt)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </header>

          {!isCancelled && (
            <ol className="dashboard-timeline" aria-label="Order progress">
              {TIMELINE_STEPS.map((step, index) => {
                const isComplete = activeIndex >= index;
                const isCurrent = activeIndex === index;

                return (
                  <li
                    key={step}
                    className={`dashboard-timeline-step${isComplete ? " is-complete" : ""}${isCurrent ? " is-current" : ""}`}
                  >
                    <span className="dashboard-timeline-dot" aria-hidden="true" />
                    <span className="dashboard-timeline-label">
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <ul className="dashboard-line-items stack-gap-cards">
            {order.items.map((item) => {
              const imageUrl = resolveProductImageUrl(
                item.productImage,
                item.productName,
                item.productName
              );

              return (
                <li key={item.id} className="dashboard-line-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={item.productName}
                    className="dashboard-line-item-image"
                  />
                  <div className="dashboard-line-item-info min-w-0">
                    <p className="dashboard-line-item-name">{item.productName}</p>
                    <p className="dashboard-line-item-meta">
                      {formatPrice(item.productPrice)} × {item.quantity}
                    </p>
                    {showReviewActions && item.productSlug && (
                      <Link
                        href={`/products/${item.productSlug}#reviews-heading`}
                        className="dashboard-line-item-review-btn"
                      >
                        Review
                      </Link>
                    )}
                  </div>
                  <span className="dashboard-line-item-total">{formatPrice(item.subtotal)}</span>
                </li>
              );
            })}
          </ul>

          <dl className="dashboard-summary-lines">
            <div className="dashboard-summary-line">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="dashboard-summary-line">
              <dt>Shipping</dt>
              <dd>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</dd>
            </div>
            <div className="dashboard-summary-line">
              <dt>Tax</dt>
              <dd>{formatPrice(order.taxAmount)}</dd>
            </div>
            <div className="dashboard-summary-line dashboard-summary-total">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <aside className="dashboard-side-stack">
          <section className="dashboard-panel">
            <h3 className="dashboard-panel-title">Shipping Address</h3>
            <address className="dashboard-address-block not-italic">
              <p>{order.address.fullName}</p>
              <p>{order.address.addressLine1}</p>
              {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
              <p>
                {order.address.city}
                {order.address.state ? `, ${order.address.state}` : ""} {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
              {order.address.phone && <p>{order.address.phone}</p>}
            </address>
          </section>

          {order.payment && (
            <section className="dashboard-panel">
              <h3 className="dashboard-panel-title">Payment</h3>
              <dl className="dashboard-meta-list">
                <div>
                  <dt>Status</dt>
                  <dd>{order.payment.status}</dd>
                </div>
                {order.payment.paymentMethod && (
                  <div>
                    <dt>Method</dt>
                    <dd className="capitalize">{order.payment.paymentMethod}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { Pagination } from "@/components/shared/Pagination";
import { OrderStatusBadge, formatOrderDate } from "./OrderStatusBadge";
import type { OrderStatus } from "@prisma/client";

export type DashboardOrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    productImage: string | null;
    subtotal: number;
  }[];
  _count: { items: number };
};

interface OrderHistoryProps {
  orders: DashboardOrderSummary[];
  page: number;
  totalPages: number;
}

export function OrderHistory({ orders, page, totalPages }: OrderHistoryProps) {
  const router = useRouter();

  if (orders.length === 0) {
    return (
      <div className="dashboard-empty">
        <p className="dashboard-empty-title">No orders yet</p>
        <p className="dashboard-empty-text">
          When you place an order, it will appear here.
        </p>
        <Link href="/shop" className="dashboard-empty-btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-orders">
      <ul className="dashboard-orders-list stack-gap-cards">
        {orders.map((order) => {
          const previewItem = order.items[0];
          const imageUrl = previewItem
            ? resolveProductImageUrl(
                previewItem.productImage,
                previewItem.productName,
                previewItem.productName
              )
            : null;
          const extraCount = order._count.items - order.items.length;

          return (
            <li key={order.id} className="dashboard-order-card">
              <div className="dashboard-order-card-head">
                <div>
                  <p className="dashboard-order-number">{order.orderNumber}</p>
                  <p className="dashboard-order-meta">
                    Placed {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="dashboard-order-card-body">
                {previewItem && (
                  <div className="dashboard-order-preview">
                    {imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={previewItem.productName}
                        className="dashboard-order-preview-image"
                      />
                    )}
                    <div className="dashboard-order-preview-info min-w-0">
                      <p className="dashboard-order-preview-name">{previewItem.productName}</p>
                      <p className="dashboard-order-preview-qty">
                        Qty {previewItem.quantity}
                        {extraCount > 0 ? ` + ${extraCount} more item${extraCount > 1 ? "s" : ""}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                <div className="dashboard-order-card-footer">
                  <span className="dashboard-order-total">{formatPrice(order.total)}</span>
                  <Link href={`/dashboard/orders/${order.id}`} className="dashboard-order-link">
                    View Details
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="dashboard-pagination-wrap">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(nextPage) => router.push(`/dashboard/orders?page=${nextPage}`)}
        />
      </div>
    </div>
  );
}

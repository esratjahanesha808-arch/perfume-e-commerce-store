import Link from "next/link";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge, formatOrderDate } from "./OrderStatusBadge";
import type { OrderStatus } from "@prisma/client";

export type DashboardRecentOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: {
    productName: string;
    productImage: string | null;
    quantity: number;
  }[];
};

interface DashboardRecentOrdersProps {
  orders: DashboardRecentOrder[];
}

export function DashboardRecentOrders({ orders }: DashboardRecentOrdersProps) {
  return (
    <section className="dashboard-panel dashboard-panel--cream dashboard-recent-orders">
      <div className="dashboard-panel-toolbar">
        <div>
          <h2 className="dashboard-panel-title">Recent Orders</h2>
          <p className="dashboard-panel-subtitle">Your latest purchases at a glance</p>
        </div>
        <Link href="/dashboard/orders" className="dashboard-panel-link">
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="dashboard-inline-empty">
          <p>No orders yet. Explore the collection to find your signature scent.</p>
          <Link href="/shop" className="dashboard-stat-link">
            Shop Now
          </Link>
        </div>
      ) : (
        <ul className="dashboard-recent-list">
          {orders.map((order) => {
            const item = order.items[0];
            const imageUrl = item
              ? resolveProductImageUrl(item.productImage, item.productName, item.productName)
              : null;

            return (
              <li key={order.id}>
                <Link href={`/dashboard/orders/${order.id}`} className="dashboard-recent-row">
                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={item?.productName ?? "Order item"}
                      className="dashboard-recent-image"
                    />
                  )}
                  <div className="dashboard-recent-info min-w-0">
                    <p className="dashboard-recent-id">{order.orderNumber}</p>
                    <p className="dashboard-recent-meta">
                      {formatOrderDate(order.createdAt)}
                      {item ? ` · ${item.productName}` : ""}
                    </p>
                  </div>
                  <div className="dashboard-recent-right">
                    <p className="dashboard-recent-price">{formatPrice(order.total)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

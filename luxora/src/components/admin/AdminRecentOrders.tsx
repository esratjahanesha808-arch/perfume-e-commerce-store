import Link from "next/link";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { AdminOrderStatusBadge } from "./AdminOrderStatusBadge";
import { formatOrderDate } from "@/components/dashboard/OrderStatusBadge";
import type { OrderStatus } from "@prisma/client";

export type AdminRecentOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  productName: string;
  productImage: string | null;
};

interface AdminRecentOrdersProps {
  orders: AdminRecentOrder[];
}

export function AdminRecentOrders({ orders }: AdminRecentOrdersProps) {
  return (
    <section className="admin-card admin-recent-orders">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Recent Orders</h2>
          <p className="admin-card-subtitle">Latest transactions</p>
        </div>
        <Link href="/admin/orders" className="admin-card-link">
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="admin-inline-empty">No orders yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Order ID</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
                <th scope="col" className="admin-table-num">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const imageUrl = resolveProductImageUrl(
                  order.productImage,
                  order.productName,
                  order.productName
                );

                return (
                  <tr key={order.id}>
                    <td>
                      <div className="admin-table-product">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt=""
                          className="admin-table-product-image"
                        />
                        <span className="admin-table-product-name">{order.productName}</span>
                      </div>
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="admin-table-id">
                        #{order.orderNumber.replace(/^LUX-/, "LX")}
                      </Link>
                    </td>
                    <td>
                      <AdminOrderStatusBadge status={order.status} />
                    </td>
                    <td className="admin-table-muted">{formatOrderDate(order.createdAt)}</td>
                    <td className="admin-table-num admin-table-strong">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

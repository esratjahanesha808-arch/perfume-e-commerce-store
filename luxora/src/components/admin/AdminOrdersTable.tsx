import Link from "next/link";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { AdminOrderStatusSelect } from "./AdminOrderStatusSelect";
import { formatOrderDate } from "@/components/dashboard/OrderStatusBadge";
import type { OrderStatus } from "@prisma/client";

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  productName: string;
  productImage: string | null;
};

interface AdminOrdersTableProps {
  orders: AdminOrderRow[];
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <section className="admin-card">
        <p className="admin-inline-empty">No orders match your filters.</p>
      </section>
    );
  }

  return (
    <section className="admin-card admin-recent-orders">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Status / Update</th>
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
                      <span className="admin-table-product-name">
                        {order.productName}
                        {order.itemCount > 1 ? ` +${order.itemCount - 1}` : ""}
                      </span>
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className="admin-table-id">
                      #{order.orderNumber.replace(/^LUX-/, "LX")}
                    </Link>
                  </td>
                  <td>
                    <div className="admin-table-customer">
                      <span className="admin-table-customer-name">{order.customerName}</span>
                      <span className="admin-table-muted">{order.customerEmail}</span>
                    </div>
                  </td>
                  <td>
                    <AdminOrderStatusSelect
                      orderId={order.id}
                      currentStatus={order.status}
                    />
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
    </section>
  );
}

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  basePath?: string;
  searchParams?: Record<string, string | undefined>;
}

export function AdminPagination({
  page,
  totalPages,
  basePath = "/admin/orders",
  searchParams = {},
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(nextPage));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav className="admin-pagination" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        className={`admin-btn admin-btn-ghost${page <= 1 ? " is-disabled" : ""}`}
        aria-disabled={page <= 1}
      >
        Previous
      </Link>
      <span className="admin-pagination-label">
        Page {page} of {totalPages}
      </span>
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        className={`admin-btn admin-btn-ghost${page >= totalPages ? " is-disabled" : ""}`}
        aria-disabled={page >= totalPages}
      >
        Next
      </Link>
    </nav>
  );
}

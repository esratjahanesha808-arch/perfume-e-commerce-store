import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export type AdminTopCustomer = {
  id: string;
  name: string;
  email: string;
  initials: string;
  orderCount: number;
  totalSpent: number;
};

interface AdminTopCustomersProps {
  customers: AdminTopCustomer[];
}

export function AdminTopCustomers({ customers }: AdminTopCustomersProps) {
  return (
    <section className="admin-card admin-top-list">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Top Customers</h2>
          <p className="admin-card-subtitle">Highest spenders this period</p>
        </div>
        <Link href="/admin/customers" className="admin-card-link">
          View All
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="admin-inline-empty">No customer orders in this period.</p>
      ) : (
        <ul className="admin-ranked-list">
          {customers.map((customer) => (
            <li key={customer.id} className="admin-ranked-row">
              <div className="admin-ranked-avatar" aria-hidden="true">
                {customer.initials}
              </div>
              <div className="admin-ranked-info min-w-0">
                <p className="admin-ranked-name">{customer.name}</p>
                <p className="admin-ranked-meta">
                  {customer.email} · {customer.orderCount} orders
                </p>
              </div>
              <p className="admin-ranked-value">{formatPrice(customer.totalSpent)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

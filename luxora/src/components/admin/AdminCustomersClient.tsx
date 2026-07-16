"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";
import { formatPrice } from "@/lib/utils";
import { AdminPagination } from "./AdminOrdersTable";
import type { AdminCustomerRow } from "@/services/admin-customer.service";

interface AdminCustomersClientProps {
  customers: AdminCustomerRow[];
  total: number;
  page: number;
  totalPages: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminCustomersClient({
  customers,
  total,
  page,
  totalPages,
}: AdminCustomersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => router.push(`/admin/customers?${params.toString()}`));
  };

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        All registered customers. Order counts and spend exclude cancelled and refunded orders.
      </p>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="admin-toolbar-count">{total} customer{total !== 1 ? "s" : ""}</p>
          <div className="admin-toolbar-search">
            <Search size={15} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search name or email…"
              aria-label="Search customers"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pushParams({ search: search.trim() || null, page: "1" });
                }
              }}
            />
          </div>
        </div>
        <div className="admin-toolbar-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={isPending}
            onClick={() => pushParams({ search: search.trim() || null, page: "1" })}
          >
            Apply
          </button>
        </div>
      </div>

      <section className="admin-card admin-recent-orders">
        {customers.length === 0 ? (
          <p className="admin-inline-empty">No customers found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Joined</th>
                  <th scope="col" className="admin-table-num">Orders</th>
                  <th scope="col" className="admin-table-num">Spent</th>
                  <th scope="col" className="admin-table-num">Points</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="min-w-0">
                        <span className="admin-table-product-name">
                          {customer.name ?? "—"}
                        </span>
                        <span className="admin-table-muted block text-xs">{customer.email}</span>
                      </div>
                    </td>
                    <td className="admin-table-muted">{formatDate(customer.createdAt)}</td>
                    <td className="admin-table-num admin-table-strong">{customer.orderCount}</td>
                    <td className="admin-table-num admin-table-strong">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="admin-table-num admin-table-muted">{customer.loyaltyPoints}</td>
                    <td>
                      <span
                        className={
                          customer.isActive
                            ? "admin-status-badge admin-status-confirmed"
                            : "admin-status-badge admin-status-cancelled"
                        }
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/customers"
        searchParams={{ search: searchParams.get("search") ?? undefined }}
      />
    </div>
  );
}

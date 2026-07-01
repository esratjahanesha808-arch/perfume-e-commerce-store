"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Search } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import type { OrderStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

interface AdminOrdersToolbarProps {
  total: number;
}

export function AdminOrdersToolbar({ total }: AdminOrdersToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const status = searchParams.get("status") ?? "";
  const page = searchParams.get("page") ?? "1";

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      startTransition(() => {
        router.push(`/admin/orders?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const exportHref = `/api/v1/admin/orders/export?${new URLSearchParams({
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  }).toString()}`;

  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar-left">
        <p className="admin-toolbar-count">{total} orders</p>
        <div className="admin-toolbar-search">
          <Search size={15} strokeWidth={1.75} aria-hidden="true" />
          <input
            type="search"
            value={search}
            placeholder="Search order #, customer…"
            aria-label="Search orders"
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                pushParams({ search: search.trim() || null, page: "1" });
              }
            }}
          />
        </div>
        <select
          className="admin-toolbar-select"
          value={status}
          aria-label="Filter by status"
          onChange={(event) =>
            pushParams({ status: event.target.value || null, page: "1" })
          }
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-toolbar-actions">
        <Link href={exportHref} className="admin-btn admin-btn-secondary">
          <Download size={15} strokeWidth={1.75} aria-hidden="true" />
          Export CSV
        </Link>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          disabled={isPending}
          onClick={() => pushParams({ search: search.trim() || null, page: "1" })}
        >
          Apply
        </button>
        {page !== "1" && (
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={() => pushParams({ page: "1", search: null, status: null })}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

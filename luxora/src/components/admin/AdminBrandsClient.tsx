"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";
import { AdminPagination } from "./AdminOrdersTable";
import type { AdminBrandRow } from "@/services/admin-brand.service";

interface AdminBrandsClientProps {
  brands: AdminBrandRow[];
  total: number;
  page: number;
  totalPages: number;
}

export function AdminBrandsClient({
  brands,
  total,
  page,
  totalPages,
}: AdminBrandsClientProps) {
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
    startTransition(() => router.push(`/admin/brands?${params.toString()}`));
  };

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        All perfume brands in the catalog. Product counts include active products only.
      </p>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="admin-toolbar-count">{total} brand{total !== 1 ? "s" : ""}</p>
          <div className="admin-toolbar-search">
            <Search size={15} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search brand name or country…"
              aria-label="Search brands"
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
        {brands.length === 0 ? (
          <p className="admin-inline-empty">No brands found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Brand</th>
                  <th scope="col">Slug</th>
                  <th scope="col">Country</th>
                  <th scope="col" className="admin-table-num">Products</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <div className="min-w-0 flex items-center gap-2">
                        {brand.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={brand.logoUrl}
                            alt=""
                            width={24}
                            height={24}
                            className="rounded-sm object-contain flex-shrink-0"
                          />
                        ) : null}
                        <span className="admin-table-product-name">{brand.name}</span>
                      </div>
                    </td>
                    <td className="admin-table-muted">{brand.slug}</td>
                    <td className="admin-table-muted">{brand.country ?? "—"}</td>
                    <td className="admin-table-num admin-table-strong">{brand.productCount}</td>
                    <td>
                      <span
                        className={
                          brand.isActive
                            ? "admin-status-badge admin-status-confirmed"
                            : "admin-status-badge admin-status-cancelled"
                        }
                      >
                        {brand.isActive ? "Active" : "Inactive"}
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
        basePath="/admin/brands"
        searchParams={{ search: searchParams.get("search") ?? undefined }}
      />
    </div>
  );
}

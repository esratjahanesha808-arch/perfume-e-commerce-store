"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";
import { AdminPagination } from "./AdminOrdersTable";
import type { AdminCategoryRow } from "@/services/admin-category.service";

interface AdminCategoriesClientProps {
  categories: AdminCategoryRow[];
  total: number;
  page: number;
  totalPages: number;
}

export function AdminCategoriesClient({
  categories,
  total,
  page,
  totalPages,
}: AdminCategoriesClientProps) {
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
    startTransition(() => router.push(`/admin/categories?${params.toString()}`));
  };

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Product categories with hierarchy. Product counts include active products only.
      </p>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="admin-toolbar-count">{total} categor{total !== 1 ? "ies" : "y"}</p>
          <div className="admin-toolbar-search">
            <Search size={15} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search category name…"
              aria-label="Search categories"
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
        {categories.length === 0 ? (
          <p className="admin-inline-empty">No categories found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">Slug</th>
                  <th scope="col">Parent</th>
                  <th scope="col" className="admin-table-num">Sort</th>
                  <th scope="col" className="admin-table-num">Products</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <span className="admin-table-product-name">{cat.name}</span>
                    </td>
                    <td className="admin-table-muted">{cat.slug}</td>
                    <td className="admin-table-muted">{cat.parentName ?? <span className="admin-table-muted">—</span>}</td>
                    <td className="admin-table-num admin-table-muted">{cat.sortOrder}</td>
                    <td className="admin-table-num admin-table-strong">{cat.productCount}</td>
                    <td>
                      <span
                        className={
                          cat.isActive
                            ? "admin-status-badge admin-status-confirmed"
                            : "admin-status-badge admin-status-cancelled"
                        }
                      >
                        {cat.isActive ? "Active" : "Inactive"}
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
        basePath="/admin/categories"
        searchParams={{ search: searchParams.get("search") ?? undefined }}
      />
    </div>
  );
}

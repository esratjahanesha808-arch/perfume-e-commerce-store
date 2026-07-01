"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminPagination } from "./AdminOrdersTable";

export type AdminCollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

interface AdminCollectionsClientProps {
  collections: AdminCollectionRow[];
  total: number;
  page: number;
  totalPages: number;
}

export function AdminCollectionsClient({
  collections,
  total,
  page,
  totalPages,
}: AdminCollectionsClientProps) {
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
    startTransition(() => router.push(`/admin/collections?${params.toString()}`));
  };

  const updateCollection = async (
    collectionId: string,
    data: { isActive?: boolean; sortOrder?: number }
  ) => {
    try {
      const response = await fetch(`/api/v1/admin/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Update failed");
        return;
      }

      toast.success("Collection updated");
      router.refresh();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Collections are managed as product categories. Assign products to a category on the
        Products page or via the database seed scripts.
      </p>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="admin-toolbar-count">{total} collections</p>
          <div className="admin-toolbar-search">
            <Search size={15} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search collection name…"
              aria-label="Search collections"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
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
        {collections.length === 0 ? (
          <p className="admin-inline-empty">No collections found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Collection</th>
                  <th scope="col">Slug</th>
                  <th scope="col" className="admin-table-num">Products</th>
                  <th scope="col" className="admin-table-num">Sort</th>
                  <th scope="col">Active</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection) => (
                  <tr key={collection.id}>
                    <td>
                      <div className="min-w-0">
                        <span className="admin-table-product-name">{collection.name}</span>
                        {collection.description ? (
                          <span className="admin-table-muted block text-xs">
                            {collection.description}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="admin-table-muted">{collection.slug}</td>
                    <td className="admin-table-num admin-table-strong">
                      {collection.productCount}
                    </td>
                    <td className="admin-table-num">
                      <input
                        type="number"
                        className="admin-table-sort-input"
                        defaultValue={collection.sortOrder}
                        min={0}
                        max={999}
                        aria-label={`Sort order for ${collection.name}`}
                        onBlur={(event) => {
                          const next = Number.parseInt(event.target.value, 10);
                          if (
                            Number.isInteger(next) &&
                            next >= 0 &&
                            next !== collection.sortOrder
                          ) {
                            void updateCollection(collection.id, { sortOrder: next });
                          }
                        }}
                      />
                    </td>
                    <td>
                      <label className="admin-toolbar-check">
                        <input
                          type="checkbox"
                          checked={collection.isActive}
                          onChange={(event) =>
                            void updateCollection(collection.id, {
                              isActive: event.target.checked,
                            })
                          }
                        />
                        {collection.isActive ? "Yes" : "No"}
                      </label>
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
        basePath="/admin/collections"
        searchParams={{ search: searchParams.get("search") ?? undefined }}
      />
    </div>
  );
}

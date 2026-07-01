"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { AdminPagination } from "./AdminOrdersTable";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  volume: string | null;
  isActive: boolean;
  isFeatured: boolean;
  brandName: string;
  categoryName: string;
  imageUrl: string | null;
  stock: number;
  available: number;
};

interface AdminProductsClientProps {
  products: AdminProductRow[];
  total: number;
  page: number;
  totalPages: number;
}

export function AdminProductsClient({
  products,
  total,
  page,
  totalPages,
}: AdminProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const status = searchParams.get("status") ?? "all";

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => router.push(`/admin/products?${params.toString()}`));
  };

  const toggleField = async (
    productId: string,
    field: "isActive" | "isFeatured",
    value: boolean
  ) => {
    try {
      const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Update failed");
        return;
      }

      toast.success("Product updated");
      router.refresh();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="admin-products-page">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="admin-toolbar-count">{total} products</p>
          <div className="admin-toolbar-search">
            <Search size={15} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search name, SKU, slug…"
              aria-label="Search products"
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
              pushParams({ status: event.target.value, page: "1" })
            }
          >
            <option value="all">All products</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
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
          <span
            className="admin-toolbar-hint"
            title="Full product create/edit form is planned — use toggles below to activate or feature products"
          >
            Product editor coming soon
          </span>
        </div>
      </div>

      <section className="admin-card admin-recent-orders">
        {products.length === 0 ? (
          <p className="admin-inline-empty">No products found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">SKU</th>
                  <th scope="col">Collection</th>
                  <th scope="col" className="admin-table-num">Stock</th>
                  <th scope="col" className="admin-table-num">Price</th>
                  <th scope="col">Active</th>
                  <th scope="col">Featured</th>
                  <th scope="col">View</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const imageUrl = resolveProductImageUrl(
                    product.imageUrl,
                    product.name,
                    product.name
                  );

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-table-product">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl} alt="" className="admin-table-product-image" />
                          <div className="min-w-0">
                            <span className="admin-table-product-name">{product.name}</span>
                            <span className="admin-table-muted block text-xs">
                              {product.brandName}
                              {product.volume ? ` · ${product.volume}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="admin-table-muted">{product.sku}</td>
                      <td className="admin-table-muted">{product.categoryName}</td>
                      <td className="admin-table-num admin-table-strong">{product.available}</td>
                      <td className="admin-table-num admin-table-strong">
                        {formatPrice(product.price)}
                      </td>
                      <td>
                        <label className="admin-toolbar-check">
                          <input
                            type="checkbox"
                            checked={product.isActive}
                            onChange={(event) =>
                              void toggleField(product.id, "isActive", event.target.checked)
                            }
                          />
                          {product.isActive ? "Yes" : "No"}
                        </label>
                      </td>
                      <td>
                        <label className="admin-toolbar-check">
                          <input
                            type="checkbox"
                            checked={product.isFeatured}
                            onChange={(event) =>
                              void toggleField(product.id, "isFeatured", event.target.checked)
                            }
                          />
                          {product.isFeatured ? "Yes" : "No"}
                        </label>
                      </td>
                      <td>
                        <Link
                          href={`/products/${product.slug}`}
                          className="admin-btn admin-btn-table"
                          target="_blank"
                        >
                          <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
                          Store
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/products"
        searchParams={{
          search: searchParams.get("search") ?? undefined,
          status: searchParams.get("status") ?? undefined,
        }}
      />
    </div>
  );
}

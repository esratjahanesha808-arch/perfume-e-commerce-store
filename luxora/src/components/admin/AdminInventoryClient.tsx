"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { resolveProductImageUrl } from "@/lib/product-images";
import { AdminPagination } from "./AdminOrdersTable";

export type AdminInventoryRow = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productSlug: string;
  imageUrl: string | null;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  reorderPoint: number;
  isLowStock: boolean;
  lastRestocked: string | null;
};

interface AdminInventoryClientProps {
  items: AdminInventoryRow[];
  total: number;
  page: number;
  totalPages: number;
  lowStockCount: number;
}

export function AdminInventoryClient({
  items,
  total,
  page,
  totalPages,
  lowStockCount,
}: AdminInventoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [quantityChange, setQuantityChange] = useState("");
  const [reason, setReason] = useState("");

  const lowStockOnly = searchParams.get("lowStockOnly") === "true";

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => {
      router.push(`/admin/inventory?${params.toString()}`);
    });
  };

  const submitAdjustment = async (productId: string) => {
    const change = Number.parseInt(quantityChange, 10);
    if (!Number.isInteger(change) || change === 0) {
      toast.error("Enter a non-zero whole number adjustment");
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/inventory/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantityChange: change, reason: reason.trim() }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Stock adjustment failed");
        return;
      }

      toast.success("Inventory updated");
      setAdjustingId(null);
      setQuantityChange("");
      setReason("");
      router.refresh();
    } catch {
      toast.error("Stock adjustment failed");
    }
  };

  return (
    <div className="admin-inventory">
      <p className="admin-page-intro">
        Stock lives in the <strong>inventory</strong> table in Neon (not on <strong>products</strong>).
        Counts here match the database. Adjustments are saved to <strong>inventory_logs</strong>.
      </p>
      {lowStockCount > 0 && (
        <div className="admin-alert admin-alert-warning">
          <AlertTriangle size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>
            {lowStockCount} product{lowStockCount === 1 ? "" : "s"} at or below low stock threshold
          </span>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="admin-toolbar-count">{total} SKUs</p>
          <div className="admin-toolbar-search">
            <Search size={15} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search product or SKU…"
              aria-label="Search inventory"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  pushParams({ search: search.trim() || null, page: "1" });
                }
              }}
            />
          </div>
          <label className="admin-toolbar-check">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(event) =>
                pushParams({
                  lowStockOnly: event.target.checked ? "true" : null,
                  page: "1",
                })
              }
            />
            Low stock only
          </label>
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

      <p className="admin-inventory-legend">
        <strong>In Stock</strong> — total units in the warehouse ·{" "}
        <strong>Reserved</strong> — held for pending checkouts ·{" "}
        <strong>Sellable</strong> — units customers can buy right now
      </p>

      <section className="admin-card admin-recent-orders">
        {items.length === 0 ? (
          <p className="admin-inline-empty">No inventory records found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">SKU</th>
                  <th scope="col" className="admin-table-num" title="Total units in warehouse">
                    In Stock
                  </th>
                  <th scope="col" className="admin-table-num" title="Units held for pending orders">
                    Reserved
                  </th>
                  <th scope="col" className="admin-table-num" title="In stock minus reserved">
                    Sellable
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const imageUrl = resolveProductImageUrl(
                    item.imageUrl,
                    item.productName,
                    item.productName
                  );
                  const isAdjusting = adjustingId === item.productId;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-table-product">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt=""
                            className="admin-table-product-image"
                          />
                          <Link
                            href={`/products/${item.productSlug}`}
                            className="admin-table-product-name admin-table-id"
                            target="_blank"
                          >
                            {item.productName}
                          </Link>
                        </div>
                      </td>
                      <td className="admin-table-muted">{item.productSku}</td>
                      <td className="admin-table-num admin-table-strong">{item.quantity}</td>
                      <td className="admin-table-num admin-table-muted">{item.reserved}</td>
                      <td className="admin-table-num admin-table-strong">{item.available}</td>
                      <td>
                        {item.isLowStock ? (
                          <span className="admin-status-badge admin-status-processing">
                            Low stock
                          </span>
                        ) : (
                          <span className="admin-status-badge admin-status-completed">
                            OK
                          </span>
                        )}
                      </td>
                      <td>
                        {isAdjusting ? (
                          <div className="admin-inline-adjust">
                            <input
                              type="number"
                              value={quantityChange}
                              placeholder="+/- qty"
                              aria-label="Quantity change"
                              onChange={(event) => setQuantityChange(event.target.value)}
                            />
                            <input
                              type="text"
                              value={reason}
                              placeholder="Reason"
                              aria-label="Adjustment reason"
                              onChange={(event) => setReason(event.target.value)}
                            />
                            <button
                              type="button"
                              className="admin-btn admin-btn-table"
                              onClick={() => submitAdjustment(item.productId)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost admin-btn-table-ghost"
                              onClick={() => {
                                setAdjustingId(null);
                                setQuantityChange("");
                                setReason("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn admin-btn-table"
                            onClick={() => {
                              setAdjustingId(item.productId);
                              setQuantityChange("");
                              setReason("");
                            }}
                          >
                            Adjust
                          </button>
                        )}
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
        basePath="/admin/inventory"
        searchParams={{
          search: searchParams.get("search") ?? undefined,
          lowStockOnly: searchParams.get("lowStockOnly") ?? undefined,
        }}
      />
    </div>
  );
}

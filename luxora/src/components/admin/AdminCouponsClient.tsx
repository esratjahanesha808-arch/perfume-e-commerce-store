"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { AdminPagination } from "./AdminOrdersTable";

export type AdminCouponRow = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
};

type CouponFormState = {
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: string;
  minOrderValue: string;
  maxDiscount: string;
  usageLimit: string;
  perUserLimit: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
};

const EMPTY_FORM: CouponFormState = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: "10",
  minOrderValue: "0",
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: "1",
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  isActive: true,
};

function formatCouponValue(coupon: AdminCouponRow) {
  if (coupon.type === "PERCENTAGE") return `${coupon.value}%`;
  if (coupon.type === "FREE_SHIPPING") return "Free shipping";
  return formatPrice(coupon.value);
}

function toFormState(coupon: AdminCouponRow): CouponFormState {
  return {
    code: coupon.code,
    description: coupon.description ?? "",
    type: coupon.type,
    value: String(coupon.value),
    minOrderValue: String(coupon.minOrderValue),
    maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
    usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
    perUserLimit: String(coupon.perUserLimit),
    validFrom: coupon.validFrom.slice(0, 10),
    validUntil: coupon.validUntil.slice(0, 10),
    isActive: coupon.isActive,
  };
}

interface AdminCouponsClientProps {
  coupons: AdminCouponRow[];
  total: number;
  page: number;
  totalPages: number;
}

export function AdminCouponsClient({
  coupons,
  total,
  page,
  totalPages,
}: AdminCouponsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const editingCoupon = useMemo(
    () => coupons.find((coupon) => coupon.id === editingId) ?? null,
    [coupons, editingId]
  );

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => router.push(`/admin/coupons?${params.toString()}`));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (coupon: AdminCouponRow) => {
    setEditingId(coupon.id);
    setForm(toFormState(coupon));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (
    field: keyof CouponFormState,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    code: form.code.trim(),
    description: form.description.trim() || undefined,
    type: form.type,
    value: form.type === "FREE_SHIPPING" ? 1 : Number(form.value),
    minOrderValue: Number(form.minOrderValue || 0),
    maxDiscount:
      form.type === "PERCENTAGE" && form.maxDiscount.trim()
        ? Number(form.maxDiscount)
        : null,
    usageLimit: form.usageLimit.trim() ? Number(form.usageLimit) : null,
    perUserLimit: Number(form.perUserLimit || 1),
    validFrom: new Date(`${form.validFrom}T00:00:00`).toISOString(),
    validUntil: new Date(`${form.validUntil}T23:59:59`).toISOString(),
    isActive: form.isActive,
  });

  const saveCoupon = async () => {
    setIsSaving(true);
    try {
      const payload = buildPayload();
      const response = await fetch(
        editingId ? `/api/v1/admin/coupons/${editingId}` : "/api/v1/admin/coupons",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(json?.error?.message ?? "Could not save coupon");
        return;
      }

      toast.success(editingId ? "Coupon updated" : "Coupon created");
      closeForm();
      router.refresh();
    } catch {
      toast.error("Could not save coupon");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;

    try {
      const response = await fetch(`/api/v1/admin/coupons/${id}`, { method: "DELETE" });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(json?.error?.message ?? "Could not delete coupon");
        return;
      }

      toast.success("Coupon deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete coupon");
    }
  };

  const toggleActive = async (coupon: AdminCouponRow) => {
    try {
      const response = await fetch(`/api/v1/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      const json = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(json?.error?.message ?? "Update failed");
        return;
      }

      toast.success(coupon.isActive ? "Coupon deactivated" : "Coupon activated");
      router.refresh();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="admin-coupons-page">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="admin-toolbar-count">{total} coupons</p>
          <div className="admin-toolbar-search">
            <Search size={15} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search code or description…"
              aria-label="Search coupons"
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
            onChange={(event) => {
              setStatus(event.target.value);
              pushParams({ status: event.target.value, page: "1" });
            }}
          >
            <option value="all">All coupons</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
        <div className="admin-toolbar-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={isPending}
            onClick={() => pushParams({ search: search.trim() || null, page: "1" })}
          >
            Apply
          </button>
          <button type="button" className="admin-btn admin-btn-primary" onClick={openCreateForm}>
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            New Coupon
          </button>
        </div>
      </div>

      {showForm && (
        <section className="admin-card admin-coupon-form-card">
          <header className="admin-card-header">
            <h2>{editingId ? `Edit ${editingCoupon?.code ?? "Coupon"}` : "Create Coupon"}</h2>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
              Cancel
            </button>
          </header>

          <div className="admin-form-stack">
            <label className="admin-field">
              Code
              <input
                type="text"
                value={form.code}
                onChange={(event) => handleFormChange("code", event.target.value.toUpperCase())}
                placeholder="WELCOME10"
              />
            </label>

            <label className="admin-field">
              Description
              <input
                type="text"
                value={form.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
                placeholder="10% off your first order"
              />
            </label>

            <div className="admin-coupon-form-grid">
              <label className="admin-field">
                Type
                <select
                  value={form.type}
                  onChange={(event) =>
                    handleFormChange(
                      "type",
                      event.target.value as CouponFormState["type"]
                    )
                  }
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed amount</option>
                  <option value="FREE_SHIPPING">Free shipping</option>
                </select>
              </label>

              {form.type !== "FREE_SHIPPING" && (
                <label className="admin-field">
                  {form.type === "PERCENTAGE" ? "Percentage" : "Amount ($)"}
                  <input
                    type="number"
                    min="0"
                    step={form.type === "PERCENTAGE" ? "1" : "0.01"}
                    value={form.value}
                    onChange={(event) => handleFormChange("value", event.target.value)}
                  />
                </label>
              )}

              <label className="admin-field">
                Min order ($)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderValue}
                  onChange={(event) => handleFormChange("minOrderValue", event.target.value)}
                />
              </label>

              {form.type === "PERCENTAGE" && (
                <label className="admin-field">
                  Max discount ($)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maxDiscount}
                    onChange={(event) => handleFormChange("maxDiscount", event.target.value)}
                    placeholder="Optional"
                  />
                </label>
              )}

              <label className="admin-field">
                Usage limit
                <input
                  type="number"
                  min="1"
                  value={form.usageLimit}
                  onChange={(event) => handleFormChange("usageLimit", event.target.value)}
                  placeholder="Unlimited"
                />
              </label>

              <label className="admin-field">
                Per-user limit
                <input
                  type="number"
                  min="1"
                  value={form.perUserLimit}
                  onChange={(event) => handleFormChange("perUserLimit", event.target.value)}
                />
              </label>

              <label className="admin-field">
                Valid from
                <input
                  type="date"
                  value={form.validFrom}
                  onChange={(event) => handleFormChange("validFrom", event.target.value)}
                />
              </label>

              <label className="admin-field">
                Valid until
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(event) => handleFormChange("validUntil", event.target.value)}
                />
              </label>
            </div>

            <label className="admin-toolbar-check">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => handleFormChange("isActive", event.target.checked)}
              />
              Active
            </label>

            <div className="admin-toolbar-actions">
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={isSaving}
                onClick={() => void saveCoupon()}
              >
                {isSaving ? "Saving…" : editingId ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="admin-card admin-recent-orders">
        {coupons.length === 0 ? (
          <p className="admin-inline-empty">No coupons found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Type</th>
                  <th scope="col">Value</th>
                  <th scope="col">Min order</th>
                  <th scope="col">Usage</th>
                  <th scope="col">Valid until</th>
                  <th scope="col">Active</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <div>
                        <strong>{coupon.code}</strong>
                        {coupon.description && (
                          <p className="admin-table-sub">{coupon.description}</p>
                        )}
                      </div>
                    </td>
                    <td>{coupon.type.replace("_", " ")}</td>
                    <td>{formatCouponValue(coupon)}</td>
                    <td>{formatPrice(coupon.minOrderValue)}</td>
                    <td>
                      {coupon.usageCount}
                      {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td>{new Date(coupon.validUntil).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className={`admin-status-pill${coupon.isActive ? " is-active" : ""}`}
                        onClick={() => void toggleActive(coupon)}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-table"
                          onClick={() => openEditForm(coupon)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-table admin-btn-table-ghost"
                          onClick={() => void deleteCoupon(coupon.id, coupon.code)}
                          aria-label={`Delete ${coupon.code}`}
                        >
                          <Trash2 size={14} strokeWidth={1.75} />
                        </button>
                      </div>
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
        searchParams={{
          search: searchParams.get("search") ?? undefined,
          status: status !== "all" ? status : undefined,
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export type DashboardAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const EMPTY_FORM = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
  isDefault: false,
};

interface AddressManagerProps {
  initialAddresses: DashboardAddress[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (address: DashboardAddress) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone ?? "",
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      state: address.state ?? "",
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      phone: form.phone || null,
      addressLine2: form.addressLine2 || null,
      state: form.state || null,
    };

    try {
      const res = await fetch(
        editingId ? `/api/v1/users/addresses/${editingId}` : "/api/v1/users/addresses",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message ?? "Could not save address.");
        return;
      }

      if (editingId) {
        setAddresses((prev) =>
          prev.map((item) => {
            if (item.id === editingId) return json.data;
            if (payload.isDefault) return { ...item, isDefault: false };
            return item;
          })
        );
      } else {
        setAddresses((prev) => {
          const next = payload.isDefault
            ? prev.map((item) => ({ ...item, isDefault: false }))
            : prev;
          return [json.data, ...next];
        });
      }

      toast.success(editingId ? "Address updated." : "Address added.");
      closeForm();
    } catch {
      toast.error("Could not save address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!window.confirm("Remove this address?")) return;

    try {
      const res = await fetch(`/api/v1/users/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error?.message ?? "Could not delete address.");
        return;
      }

      setAddresses((prev) => prev.filter((item) => item.id !== addressId));
      toast.success("Address removed.");
    } catch {
      toast.error("Could not delete address.");
    }
  };

  return (
    <div className="dashboard-addresses">
      <div className="dashboard-panel-toolbar">
        <div>
          <h2 className="dashboard-panel-title">Saved Addresses</h2>
          <p className="dashboard-panel-subtitle">Manage shipping addresses for faster checkout.</p>
        </div>
        {!isFormOpen && (
          <button type="button" className="dashboard-secondary-btn" onClick={openCreate}>
            <Plus size={14} />
            Add Address
          </button>
        )}
      </div>

      {isFormOpen && (
        <form className="dashboard-panel dashboard-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="dashboard-form-toolbar">
            <h3 className="dashboard-form-title">{editingId ? "Edit Address" : "New Address"}</h3>
            <button type="button" className="dashboard-icon-btn" onClick={closeForm} aria-label="Close form">
              <X size={16} />
            </button>
          </div>

          <div className="dashboard-form-grid">
            <div className="dashboard-field">
              <label htmlFor="addr-label">Label</label>
              <input
                id="addr-label"
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                required
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="addr-name">Full name</label>
              <input
                id="addr-name"
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="addr-phone">Phone</label>
              <input
                id="addr-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="dashboard-field dashboard-field-full">
              <label htmlFor="addr-line1">Address line 1</label>
              <input
                id="addr-line1"
                value={form.addressLine1}
                onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                required
              />
            </div>
            <div className="dashboard-field dashboard-field-full">
              <label htmlFor="addr-line2">Address line 2</label>
              <input
                id="addr-line2"
                value={form.addressLine2}
                onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="addr-city">City</label>
              <input
                id="addr-city"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="addr-state">State</label>
              <input
                id="addr-state"
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="addr-zip">ZIP / Postal code</label>
              <input
                id="addr-zip"
                value={form.postalCode}
                onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                required
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="addr-country">Country</label>
              <input
                id="addr-country"
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                required
              />
            </div>
          </div>

          <label className="dashboard-checkbox-row">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
            />
            <span>Set as default address</span>
          </label>

          <div className="dashboard-form-actions">
            <button type="button" className="dashboard-secondary-btn" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="dashboard-primary-btn" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editingId ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !isFormOpen ? (
        <div className="dashboard-empty">
          <p className="dashboard-empty-title">No saved addresses</p>
          <p className="dashboard-empty-text">Add an address to speed up future checkouts.</p>
        </div>
      ) : (
        <ul className="dashboard-address-list stack-gap-cards">
          {addresses.map((address) => (
            <li key={address.id} className="dashboard-address-card">
              <div className="dashboard-address-card-head">
                <div>
                  <p className="dashboard-address-label">
                    {address.label}
                    {address.isDefault && (
                      <span className="dashboard-default-badge">Default</span>
                    )}
                  </p>
                  <p className="dashboard-address-name">{address.fullName}</p>
                </div>
                <div className="dashboard-address-actions">
                  <button
                    type="button"
                    className="dashboard-icon-btn"
                    onClick={() => openEdit(address)}
                    aria-label={`Edit ${address.label} address`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="dashboard-icon-btn"
                    onClick={() => void handleDelete(address.id)}
                    aria-label={`Delete ${address.label} address`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <address className="dashboard-address-block not-italic">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}
                  {address.state ? `, ${address.state}` : ""} {address.postalCode}
                </p>
                <p>{address.country}</p>
                {address.phone && <p>{address.phone}</p>}
              </address>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

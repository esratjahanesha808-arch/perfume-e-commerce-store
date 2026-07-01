"use client";

import { UserRound } from "lucide-react";

export interface ShippingFormValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  saveInfo: boolean;
}

interface CheckoutShippingFormProps {
  values: ShippingFormValues;
  onChange: (field: keyof ShippingFormValues, value: string | boolean) => void;
}

const COUNTRIES = ["United States", "United Kingdom", "Canada", "France", "Germany", "UAE"];

export function CheckoutShippingForm({ values, onChange }: CheckoutShippingFormProps) {
  return (
    <section className="checkout-panel" aria-labelledby="checkout-shipping-heading">
      <header className="checkout-panel-header">
        <UserRound size={16} strokeWidth={1.75} className="checkout-panel-icon" />
        <h2 id="checkout-shipping-heading" className="checkout-panel-title">
          Shipping Information
        </h2>
      </header>

      <div className="checkout-form-stack">
        <label className="checkout-field">
          <span className="checkout-field-label">Full Name</span>
          <input
            type="text"
            value={values.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Full Name"
            autoComplete="name"
          />
        </label>

        <label className="checkout-field">
          <span className="checkout-field-label">Email Address</span>
          <input
            type="email"
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Email Address"
            autoComplete="email"
          />
        </label>

        <label className="checkout-field">
          <span className="checkout-field-label">Phone Number</span>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Phone Number"
            autoComplete="tel"
          />
        </label>

        <label className="checkout-field">
          <span className="checkout-field-label">Address</span>
          <input
            type="text"
            value={values.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Address"
            autoComplete="street-address"
          />
        </label>

        <label className="checkout-field">
          <span className="checkout-field-label">City</span>
          <input
            type="text"
            value={values.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="City"
            autoComplete="address-level2"
          />
        </label>

        <div className="checkout-field-row">
          <label className="checkout-field">
            <span className="checkout-field-label">State / Province</span>
            <select
              value={values.state}
              onChange={(e) => onChange("state", e.target.value)}
              autoComplete="address-level1"
            >
              <option value="">Select</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              <option value="ON">Ontario</option>
              <option value="LDN">London</option>
            </select>
          </label>

          <label className="checkout-field">
            <span className="checkout-field-label">Country</span>
            <select
              value={values.country}
              onChange={(e) => onChange("country", e.target.value)}
              autoComplete="country-name"
            >
              <option value="">Select</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="checkout-field">
          <span className="checkout-field-label">ZIP / Postal Code</span>
          <input
            type="text"
            value={values.zip}
            onChange={(e) => onChange("zip", e.target.value)}
            placeholder="ZIP / Postal Code"
            autoComplete="postal-code"
          />
        </label>

        <label className="checkout-checkbox">
          <input
            type="checkbox"
            checked={values.saveInfo}
            onChange={(e) => onChange("saveInfo", e.target.checked)}
          />
          <span>Save this information for next time</span>
        </label>
      </div>
    </section>
  );
}

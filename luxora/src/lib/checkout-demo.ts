import type { ShippingFormValues } from "@/components/checkout/CheckoutShippingForm";

/** Safe demo data for local checkout testing — no real PII required. */
export const DEMO_SHIPPING: ShippingFormValues = {
  fullName: "Alex Demo",
  email: "demo@luxora.test",
  phone: "+1 (555) 000-0000",
  address: "123 Fragrance Lane",
  city: "New York",
  state: "NY",
  country: "United States",
  zip: "10001",
  saveInfo: false,
};

export const DEMO_CARD = {
  cardNumber: "4242 4242 4242 4242",
  cardExpiry: "12 / 34",
  cardCvv: "123",
  cardName: "Alex Demo",
};

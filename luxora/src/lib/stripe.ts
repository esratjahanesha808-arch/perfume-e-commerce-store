import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? "";

export const isStripeConfigured =
  secretKey.length > 0 &&
  secretKey.startsWith("sk_") &&
  !secretKey.includes("placeholder");

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeConfigured) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeClient;
}

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
}

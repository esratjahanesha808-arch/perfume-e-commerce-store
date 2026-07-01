import { z } from "zod";

export const checkoutShippingSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  zip: z.string().min(1),
  saveInfo: z.boolean().default(false),
});

export const checkoutOrderSchema = z.object({
  shipping: checkoutShippingSchema,
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["card", "paypal", "apple", "google"]),
  couponCode: z.string().trim().max(50).optional(),
});

export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;

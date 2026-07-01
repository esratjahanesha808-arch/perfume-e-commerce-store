import { db, isDbConfigured } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import type { CheckoutOrderInput } from "@/lib/validations/checkout";
import { clearUserCart, getUserCart } from "@/services/cart.service";
import {
  getShippingCostForCoupon,
  validateCouponForUser,
} from "@/services/coupon.service";

export async function createPendingOrderFromCheckout(
  userId: string,
  input: CheckoutOrderInput
) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const cartItems = await getUserCart(userId);
  if (cartItems.length === 0) throw new Error("EMPTY_CART");

  for (const item of cartItems) {
    if (!item.inStock) throw new Error("OUT_OF_STOCK");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let shippingCost = getShippingCostForCoupon(input.shippingMethod, subtotal);
  let discountAmount = 0;
  let couponId: string | undefined;

  if (input.couponCode?.trim()) {
    const validated = await validateCouponForUser(
      input.couponCode,
      userId,
      subtotal,
      input.shippingMethod
    );
    couponId = validated.coupon.id;
    discountAmount = validated.discountAmount;
    shippingCost = validated.shippingCost;
  }

  const taxAmount = 0;
  const total = subtotal - discountAmount + shippingCost + taxAmount;
  const { shipping } = input;

  const order = await db.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId,
        label: shipping.saveInfo ? "Checkout" : "One-time",
        fullName: shipping.fullName,
        phone: shipping.phone,
        addressLine1: shipping.address,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.zip,
        country: shipping.country,
        isDefault: false,
      },
      select: { id: true },
    });

    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId: address.id,
        status: "PENDING",
        subtotal,
        discountAmount,
        shippingCost,
        taxAmount,
        total,
        couponId,
        notes: `Payment method: ${input.paymentMethod}; Shipping: ${input.shippingMethod}${
          input.couponCode ? `; Coupon: ${input.couponCode.trim().toUpperCase()}` : ""
        }`,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productPrice: item.product.price,
            productImage: item.product.images[0]?.url ?? null,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity,
          })),
        },
      },
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        discountAmount: true,
        total: true,
        status: true,
        shippingCost: true,
        couponId: true,
        items: {
          select: {
            productName: true,
            productPrice: true,
            productImage: true,
            quantity: true,
          },
        },
      },
    });

    return created;
  });

  return order;
}

/** Legacy direct checkout — clears cart immediately (no Stripe). */
export async function createOrderFromCheckout(userId: string, input: CheckoutOrderInput) {
  const order = await createPendingOrderFromCheckout(userId, input);
  await clearUserCart(userId);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    total: order.total,
    status: order.status,
  };
}

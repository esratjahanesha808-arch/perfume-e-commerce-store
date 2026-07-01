import type Stripe from "stripe";
import { db, isDbConfigured } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { CheckoutOrderInput } from "@/lib/validations/checkout";
import { clearUserCart } from "@/services/cart.service";
import { recordCouponUsage } from "@/services/coupon.service";
import { createPendingOrderFromCheckout } from "@/services/checkout.service";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function toAbsoluteImageUrl(url: string | null | undefined) {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${APP_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function createStripeCheckoutSession(
  userId: string,
  input: CheckoutOrderInput
) {
  if (!isDbConfigured) throw new Error("Database not configured");
  if (!isStripeConfigured) throw new Error("STRIPE_NOT_CONFIGURED");

  const order = await createPendingOrderFromCheckout(userId, input);
  const stripe = getStripe();

  const subtotal = Number(order.subtotal);
  const discountAmount = Number(order.discountAmount);
  const discountFactor =
    discountAmount > 0 && subtotal > 0 ? (subtotal - discountAmount) / subtotal : 1;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map(
    (item) => ({
      price_data: {
        currency: "usd",
        unit_amount: Math.max(
          1,
          Math.round(Number(item.productPrice) * discountFactor * 100)
        ),
        product_data: {
          name: item.productName,
          images: item.productImage
            ? [toAbsoluteImageUrl(item.productImage)!].filter(Boolean)
            : undefined,
        },
      },
      quantity: item.quantity,
    })
  );

  const shippingCost = Number(order.shippingCost);
  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        unit_amount: Math.round(shippingCost * 100),
        product_data: {
          name:
            input.shippingMethod === "express"
              ? "Express Shipping"
              : "Standard Shipping",
        },
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    mode: "payment",
    customer_email: input.shipping.email,
    line_items: lineItems,
    metadata: {
      orderId: order.id,
      userId,
      orderNumber: order.orderNumber,
      ...(order.couponId ? { couponId: order.couponId } : {}),
    },
    return_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.client_secret) {
    throw new Error("STRIPE_SESSION_MISSING_SECRET");
  }

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: Number(order.total),
  };
}

export async function getCheckoutSessionForUser(sessionId: string, userId: string) {
  if (!isStripeConfigured) throw new Error("STRIPE_NOT_CONFIGURED");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.metadata?.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  const orderNumber = session.metadata?.orderNumber ?? null;
  const orderId = session.metadata?.orderId ?? null;

  if (session.payment_status === "paid" && orderId) {
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    await fulfillOrderAfterPayment({
      orderId,
      stripeSessionId: session.id,
      stripePaymentId: paymentIntentId ?? session.id,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      paymentMethod: session.payment_method_types?.[0] ?? "card",
      receiptUrl: null,
    });
  }

  return {
    sessionId: session.id,
    orderNumber,
    paymentStatus: session.payment_status,
    status: session.status,
    amountTotal: session.amount_total ? session.amount_total / 100 : null,
  };
}

export async function fulfillOrderAfterPayment(params: {
  orderId: string;
  stripeSessionId: string;
  stripePaymentId: string;
  amount: number;
  paymentMethod?: string | null;
  receiptUrl?: string | null;
}) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const existingPayment = await db.payment.findFirst({
    where: {
      OR: [
        { stripeSessionId: params.stripeSessionId },
        { stripePaymentId: params.stripePaymentId },
      ],
    },
    select: { id: true, orderId: true },
  });

  if (existingPayment) {
    return { orderId: existingPayment.orderId, alreadyProcessed: true };
  }

  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: params.orderId },
      include: {
        items: true,
        user: { select: { email: true, name: true } },
        address: true,
      },
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (order.status === "CONFIRMED" || order.status === "PROCESSING") {
      return { order, alreadyProcessed: true };
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "CONFIRMED" },
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        stripePaymentId: params.stripePaymentId,
        stripeSessionId: params.stripeSessionId,
        amount: params.amount,
        currency: "USD",
        status: "SUCCEEDED",
        paymentMethod: params.paymentMethod ?? "card",
        receiptUrl: params.receiptUrl ?? undefined,
      },
    });

    for (const item of order.items) {
      const inventory = await tx.inventory.findUnique({
        where: { productId: item.productId },
      });

      if (inventory) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: Math.max(0, inventory.quantity - item.quantity),
          },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { userId: order.userId } });

    if (order.couponId) {
      await recordCouponUsage(tx, order.couponId, order.userId, order.id);
    }

    const pointsEarned = Math.floor(Number(order.total) * 2);
    if (pointsEarned > 0) {
      await tx.user.update({
        where: { id: order.userId },
        data: { loyaltyPoints: { increment: pointsEarned } },
      });
    }

    return { order, alreadyProcessed: false };
  });

  if (!result.alreadyProcessed && result.order.user.email) {
    void sendOrderConfirmationEmail({
      email: result.order.user.email,
      name: result.order.user.name ?? "Customer",
      orderNumber: result.order.orderNumber,
      total: Number(result.order.total),
    });
  }

  return {
    orderId: result.order.id,
    orderNumber: result.order.orderNumber,
    alreadyProcessed: result.alreadyProcessed,
  };
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId || session.payment_status !== "paid") {
        return { handled: false, reason: "missing_order_or_unpaid" };
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      const stripePaymentId = paymentIntentId ?? session.id;
      const amount = session.amount_total ? session.amount_total / 100 : 0;

      const result = await fulfillOrderAfterPayment({
        orderId,
        stripeSessionId: session.id,
        stripePaymentId,
        amount,
        paymentMethod: session.payment_method_types?.[0] ?? "card",
        receiptUrl: null,
      });

      return { handled: true, ...result };
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (!orderId) return { handled: false, reason: "missing_order" };

      await db.order.updateMany({
        where: { id: orderId, status: "PENDING" },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });

      return { handled: true, orderId, cancelled: true };
    }

    default:
      return { handled: false, reason: "ignored_event_type" };
  }
}

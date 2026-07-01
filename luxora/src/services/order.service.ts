import { db, isDbConfigured } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import type { AdminOrderListQuery } from "@/lib/validations/order";

const ORDERS_PER_PAGE = 8;
const ADMIN_ORDERS_PER_PAGE = 15;

export async function getUserOrders(userId: string, page = 1) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * ORDERS_PER_PAGE;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: ORDERS_PER_PAGE,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            productImage: true,
            subtotal: true,
          },
          take: 3,
        },
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where: { userId } }),
  ]);

  return {
    orders: orders.map((order) => ({
      ...order,
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        subtotal: Number(item.subtotal),
      })),
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / ORDERS_PER_PAGE)),
    perPage: ORDERS_PER_PAGE,
  };
}

export async function getUserOrderById(userId: string, orderId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: { select: { slug: true } },
        },
      },
      address: true,
      payment: {
        select: {
          status: true,
          paymentMethod: true,
          receiptUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    shippingCost: Number(order.shippingCost),
    taxAmount: Number(order.taxAmount),
    total: Number(order.total),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productPrice: Number(item.productPrice),
      productImage: item.productImage,
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      productSlug: item.product.slug,
    })),
  };
}

export async function getUserOrderStats(userId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const [totalOrders, recentOrder] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.order.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true, status: true, createdAt: true },
    }),
  ]);

  return { totalOrders, recentOrder };
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

function buildAdminOrderWhere(params: Pick<AdminOrderListQuery, "status" | "search">) {
  const normalizedSearch = params.search
    ? normalizeAdminOrderSearch(params.search)
    : undefined;

  return {
    ...(params.status ? { status: params.status } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            { orderNumber: { contains: normalizedSearch, mode: "insensitive" as const } },
            { user: { email: { contains: normalizedSearch, mode: "insensitive" as const } } },
            { user: { name: { contains: normalizedSearch, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
}

export function normalizeAdminOrderSearch(raw: string) {
  let term = raw.trim();
  if (term.startsWith("#")) term = term.slice(1);
  if (/^lx/i.test(term) && !/^lux-/i.test(term)) {
    term = `LUX-${term.slice(2)}`;
  }
  return term;
}

export async function getAdminOrders(params: AdminOrderListQuery) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const safePage = Math.max(1, params.page);
  const skip = (safePage - 1) * ADMIN_ORDERS_PER_PAGE;
  const where = buildAdminOrderWhere(params);

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { [params.sort]: params.direction },
      skip,
      take: ADMIN_ORDERS_PER_PAGE,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        items: {
          take: 1,
          select: {
            productName: true,
            productImage: true,
            quantity: true,
          },
        },
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      customerName: order.user.name ?? "Customer",
      customerEmail: order.user.email,
      itemCount: order._count.items,
      productName: order.items[0]?.productName ?? "—",
      productImage: order.items[0]?.productImage ?? null,
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_ORDERS_PER_PAGE)),
    perPage: ADMIN_ORDERS_PER_PAGE,
  };
}

export async function getAdminOrderById(orderId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      address: true,
      user: { select: { id: true, name: true, email: true } },
      payment: {
        select: {
          status: true,
          paymentMethod: true,
          receiptUrl: true,
          createdAt: true,
          refundAmount: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    shippingCost: Number(order.shippingCost),
    taxAmount: Number(order.taxAmount),
    total: Number(order.total),
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    customer: {
      id: order.user.id,
      name: order.user.name ?? "Customer",
      email: order.user.email,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productPrice: Number(item.productPrice),
      productImage: item.productImage,
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    })),
    address: {
      fullName: order.address.fullName,
      phone: order.address.phone,
      addressLine1: order.address.addressLine1,
      addressLine2: order.address.addressLine2,
      city: order.address.city,
      state: order.address.state,
      postalCode: order.address.postalCode,
      country: order.address.country,
    },
    payment: order.payment
      ? {
          status: order.payment.status,
          paymentMethod: order.payment.paymentMethod,
          receiptUrl: order.payment.receiptUrl,
          createdAt: order.payment.createdAt.toISOString(),
          refundAmount: Number(order.payment.refundAmount),
        }
      : null,
  };
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminUserId: string,
  note?: string
) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const existing = await db.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!existing) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (existing.status === status) {
    return getAdminOrderById(orderId);
  }

  const now = new Date();
  const timestampData: {
    shippedAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
  } = {};

  if (status === "SHIPPED" && !existing.shippedAt) timestampData.shippedAt = now;
  if (status === "DELIVERED" && !existing.deliveredAt) timestampData.deliveredAt = now;
  if (status === "CANCELLED" && !existing.cancelledAt) timestampData.cancelledAt = now;
  if (status === "REFUNDED" && !existing.cancelledAt) timestampData.cancelledAt = now;

  await db.order.update({
    where: { id: orderId },
    data: {
      status,
      ...timestampData,
      ...(note ? { notes: note } : {}),
    },
  });

  await sendOrderStatusUpdateEmail({
    email: existing.user.email,
    name: existing.user.name ?? "Customer",
    orderNumber: existing.orderNumber,
    status,
    statusLabel: STATUS_LABELS[status],
    total: Number(existing.total),
  });

  void adminUserId;

  return getAdminOrderById(orderId);
}

function escapeCsvValue(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function exportAdminOrdersCsv(
  params: Pick<AdminOrderListQuery, "status" | "search">
) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const normalizedParams = {
    ...params,
    search: params.search ? normalizeAdminOrderSearch(params.search) : undefined,
  };

  const orders = await db.order.findMany({
    where: buildAdminOrderWhere(normalizedParams),
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      user: { select: { email: true, name: true } },
      _count: { select: { items: true } },
    },
  });

  const header = [
    "Order Number",
    "Customer Name",
    "Customer Email",
    "Status",
    "Items",
    "Total",
    "Created At",
  ].join(",");

  const rows = orders.map((order) =>
    [
      escapeCsvValue(order.orderNumber),
      escapeCsvValue(order.user.name ?? ""),
      escapeCsvValue(order.user.email),
      escapeCsvValue(order.status),
      escapeCsvValue(order._count.items),
      escapeCsvValue(Number(order.total).toFixed(2)),
      escapeCsvValue(order.createdAt.toISOString()),
    ].join(",")
  );

  return [header, ...rows].join("\n");
}

import { Prisma } from "@prisma/client";
import { db, isDbConfigured } from "@/lib/prisma";
import type { InventoryChangeType } from "@prisma/client";
import type { AdminInventoryListQuery } from "@/lib/validations/inventory";

const INVENTORY_PER_PAGE = 20;

async function createInventoryAuditLog(
  tx: Omit<typeof db, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">,
  data: {
    productId: string;
    adminUserId: string;
    changeType: InventoryChangeType;
    quantityBefore: number;
    quantityChange: number;
    quantityAfter: number;
    reason: string;
  }
) {
  const logClient = (
    tx as typeof db & {
      inventoryLog?: { create: typeof db.inventoryLog.create };
    }
  ).inventoryLog;

  if (logClient?.create) {
    await logClient.create({ data });
    return;
  }

  const id = `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  await tx.$executeRaw`
    INSERT INTO inventory_logs (
      id, product_id, admin_user_id, change_type,
      quantity_before, quantity_change, quantity_after, reason, created_at
    ) VALUES (
      ${id},
      ${data.productId},
      ${data.adminUserId},
      ${data.changeType}::"InventoryChangeType",
      ${data.quantityBefore},
      ${data.quantityChange},
      ${data.quantityAfter},
      ${data.reason},
      NOW()
    )
  `;
}

type InventoryRow = {
  id: string;
  product_id: string;
  quantity: number;
  reserved: number;
  low_stock_threshold: number;
  reorder_point: number;
  last_restocked: Date | null;
  product_name: string;
  product_sku: string;
  product_slug: string;
  image_url: string | null;
};

function buildInventoryFilters(params: AdminInventoryListQuery) {
  const filters: Prisma.Sql[] = [Prisma.sql`p.is_active = true`];

  if (params.lowStockOnly) {
    filters.push(Prisma.sql`i.quantity <= i.low_stock_threshold`);
  }

  if (params.search) {
    const term = `%${params.search}%`;
    filters.push(
      Prisma.sql`(p.name ILIKE ${term} OR p.sku ILIKE ${term})`
    );
  }

  return Prisma.join(filters, " AND ");
}

export async function getAdminInventoryList(params: AdminInventoryListQuery) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const safePage = Math.max(1, params.page);
  const skip = (safePage - 1) * INVENTORY_PER_PAGE;
  const whereClause = buildInventoryFilters(params);

  const [countRows, rows] = await Promise.all([
    db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM inventory i
      INNER JOIN products p ON p.id = i.product_id
      WHERE ${whereClause}
    `,
    db.$queryRaw<InventoryRow[]>`
      SELECT
        i.id,
        i.product_id,
        i.quantity,
        i.reserved,
        i.low_stock_threshold,
        i.reorder_point,
        i.last_restocked,
        p.name AS product_name,
        p.sku AS product_sku,
        p.slug AS product_slug,
        (
          SELECT pi.url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC
          LIMIT 1
        ) AS image_url
      FROM inventory i
      INNER JOIN products p ON p.id = i.product_id
      WHERE ${whereClause}
      ORDER BY (i.quantity - i.reserved) ASC, p.name ASC
      LIMIT ${INVENTORY_PER_PAGE} OFFSET ${skip}
    `,
  ]);

  const total = Number(countRows[0]?.count ?? 0);

  return {
    items: rows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      productSku: row.product_sku,
      productSlug: row.product_slug,
      imageUrl: row.image_url,
      quantity: row.quantity,
      reserved: row.reserved,
      available: row.quantity - row.reserved,
      lowStockThreshold: row.low_stock_threshold,
      reorderPoint: row.reorder_point,
      isLowStock: row.quantity <= row.low_stock_threshold,
      lastRestocked: row.last_restocked?.toISOString() ?? null,
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / INVENTORY_PER_PAGE)),
    perPage: INVENTORY_PER_PAGE,
  };
}

export async function getAdminLowStockCount() {
  if (!isDbConfigured) return 0;

  const result = await db.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM inventory
    WHERE quantity <= low_stock_threshold
  `;

  return Number(result[0]?.count ?? 0);
}

export async function adjustInventory(params: {
  productId: string;
  quantityChange: number;
  reason: string;
  changeType: InventoryChangeType;
  adminUserId: string;
}) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const { productId, quantityChange, reason, changeType, adminUserId } = params;

  return db.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: { productId },
      include: { product: { select: { name: true, sku: true } } },
    });

    if (!inventory) {
      throw new Error("INVENTORY_NOT_FOUND");
    }

    const quantityBefore = inventory.quantity;
    const quantityAfter = quantityBefore + quantityChange;

    if (quantityAfter < 0) {
      throw new Error("STOCK_BELOW_ZERO");
    }

    if (quantityAfter < inventory.reserved) {
      throw new Error("STOCK_BELOW_RESERVED");
    }

    const updated = await tx.inventory.update({
      where: { productId },
      data: {
        quantity: quantityAfter,
        ...(quantityChange > 0 ? { lastRestocked: new Date() } : {}),
      },
    });

    await createInventoryAuditLog(tx, {
      productId,
      adminUserId,
      changeType,
      quantityBefore,
      quantityChange,
      quantityAfter,
      reason,
    });

    return {
      productId,
      productName: inventory.product.name,
      productSku: inventory.product.sku,
      quantityBefore,
      quantityChange,
      quantityAfter: updated.quantity,
      reserved: updated.reserved,
      available: updated.quantity - updated.reserved,
      isLowStock: updated.quantity <= updated.lowStockThreshold,
    };
  });
}

export async function getInventoryLogs(productId: string, limit = 10) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const logs = await db.inventoryLog.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs.map((log) => ({
    id: log.id,
    changeType: log.changeType,
    quantityBefore: log.quantityBefore,
    quantityChange: log.quantityChange,
    quantityAfter: log.quantityAfter,
    reason: log.reason,
    createdAt: log.createdAt.toISOString(),
  }));
}

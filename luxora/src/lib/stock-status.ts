export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

type InventorySnapshot = {
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
};

export function getStockStatus(
  inventory?: InventorySnapshot | null
): { status: StockStatus; label: string } {
  if (!inventory) {
    return { status: "in_stock", label: "In Stock" };
  }

  const available = inventory.quantity - inventory.reserved;

  if (available <= 0) {
    return { status: "out_of_stock", label: "Out of Stock" };
  }

  if (available <= inventory.lowStockThreshold) {
    return { status: "low_stock", label: "Low Stock" };
  }

  return { status: "in_stock", label: "In Stock" };
}

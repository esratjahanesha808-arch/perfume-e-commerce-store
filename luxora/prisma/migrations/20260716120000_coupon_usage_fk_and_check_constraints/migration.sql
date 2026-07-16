-- Integrity: prevent orphan coupon usage rows without a matching order
-- AlterTable
CREATE INDEX "coupon_usages_order_id_idx" ON "coupon_usages"("order_id");

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Critical CHECK constraints (ratings / quantities / non-negative inventory)
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_quantity_check" CHECK ("quantity" >= 1);

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_check" CHECK ("quantity" >= 1);

ALTER TABLE "inventory" ADD CONSTRAINT "inventory_quantity_non_negative_check" CHECK ("quantity" >= 0);

ALTER TABLE "inventory" ADD CONSTRAINT "inventory_reserved_non_negative_check" CHECK ("reserved" >= 0);

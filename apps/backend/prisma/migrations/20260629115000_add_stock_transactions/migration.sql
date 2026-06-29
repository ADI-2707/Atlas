-- CreateTable
CREATE TABLE "atlas_inventory"."inv_stock_transactions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "warehouse_id" TEXT,
    "to_warehouse_id" TEXT,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reference" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inv_stock_transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "atlas_inventory"."inv_stock_transactions" ADD CONSTRAINT "inv_stock_transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "atlas_inventory"."inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_inventory"."inv_stock_transactions" ADD CONSTRAINT "inv_stock_transactions_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "atlas_inventory"."inv_warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_inventory"."inv_stock_transactions" ADD CONSTRAINT "inv_stock_transactions_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "atlas_inventory"."inv_warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

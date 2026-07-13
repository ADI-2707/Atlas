/*
  Warnings:

  - You are about to drop the `crm_customers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_deal_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_deals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hr_departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hr_employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hr_leave_balances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hr_leave_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hr_payroll_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inv_products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inv_stock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inv_stock_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inv_tables` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inv_warehouses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "atlas_crm"."crm_deal_items" DROP CONSTRAINT "crm_deal_items_deal_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_crm"."crm_deal_items" DROP CONSTRAINT "crm_deal_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_crm"."crm_deals" DROP CONSTRAINT "crm_deals_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_hr"."hr_employees" DROP CONSTRAINT "hr_employees_department_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_hr"."hr_employees" DROP CONSTRAINT "hr_employees_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_hr"."hr_leave_balances" DROP CONSTRAINT "hr_leave_balances_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_hr"."hr_leave_requests" DROP CONSTRAINT "hr_leave_requests_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_hr"."hr_payroll_records" DROP CONSTRAINT "hr_payroll_records_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_inventory"."inv_products" DROP CONSTRAINT "inv_products_table_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_inventory"."inv_stock" DROP CONSTRAINT "inv_stock_product_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_inventory"."inv_stock" DROP CONSTRAINT "inv_stock_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_inventory"."inv_stock_transactions" DROP CONSTRAINT "inv_stock_transactions_product_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_inventory"."inv_stock_transactions" DROP CONSTRAINT "inv_stock_transactions_to_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "atlas_inventory"."inv_stock_transactions" DROP CONSTRAINT "inv_stock_transactions_warehouse_id_fkey";

-- AlterTable
ALTER TABLE "atlas_core"."organizations" ADD COLUMN     "health_score" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
ADD COLUMN     "mrr" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- DropTable
DROP TABLE "atlas_crm"."crm_customers";

-- DropTable
DROP TABLE "atlas_crm"."crm_deal_items";

-- DropTable
DROP TABLE "atlas_crm"."crm_deals";

-- DropTable
DROP TABLE "atlas_hr"."hr_departments";

-- DropTable
DROP TABLE "atlas_hr"."hr_employees";

-- DropTable
DROP TABLE "atlas_hr"."hr_leave_balances";

-- DropTable
DROP TABLE "atlas_hr"."hr_leave_requests";

-- DropTable
DROP TABLE "atlas_hr"."hr_payroll_records";

-- DropTable
DROP TABLE "atlas_inventory"."inv_products";

-- DropTable
DROP TABLE "atlas_inventory"."inv_stock";

-- DropTable
DROP TABLE "atlas_inventory"."inv_stock_transactions";

-- DropTable
DROP TABLE "atlas_inventory"."inv_tables";

-- DropTable
DROP TABLE "atlas_inventory"."inv_warehouses";

-- CreateTable
CREATE TABLE "atlas_core"."plugin_data" (
    "id" TEXT NOT NULL,
    "plugin_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_core"."system_logs" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_core"."support_tickets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plugin_data_plugin_id_organization_id_entity_type_idx" ON "atlas_core"."plugin_data"("plugin_id", "organization_id", "entity_type");

-- AddForeignKey
ALTER TABLE "atlas_core"."plugin_data" ADD CONSTRAINT "plugin_data_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "atlas_core"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_core"."plugin_data" ADD CONSTRAINT "plugin_data_plugin_id_fkey" FOREIGN KEY ("plugin_id") REFERENCES "atlas_core"."plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_core"."support_tickets" ADD CONSTRAINT "support_tickets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "atlas_core"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

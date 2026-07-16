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
ALTER TABLE "atlas_core"."organizations" ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'starter';

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
CREATE TABLE "atlas_core"."invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role_ids" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_core"."organization_plugins" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "plugin_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENABLED',
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_plugins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "atlas_core"."invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_email_organization_id_key" ON "atlas_core"."invitations"("email", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_plugins_organization_id_plugin_id_key" ON "atlas_core"."organization_plugins"("organization_id", "plugin_id");

-- AddForeignKey
ALTER TABLE "atlas_core"."invitations" ADD CONSTRAINT "invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "atlas_core"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_core"."organization_plugins" ADD CONSTRAINT "organization_plugins_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "atlas_core"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_core"."organization_plugins" ADD CONSTRAINT "organization_plugins_plugin_id_fkey" FOREIGN KEY ("plugin_id") REFERENCES "atlas_core"."plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

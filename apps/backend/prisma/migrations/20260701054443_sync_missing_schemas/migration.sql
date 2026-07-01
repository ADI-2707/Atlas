-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "atlas_crm";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "atlas_hr";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "atlas_inventory";

-- CreateTable
CREATE TABLE "atlas_inventory"."inv_tables" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fieldSchema" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inv_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_inventory"."inv_products" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "base_price" DOUBLE PRECISION NOT NULL,
    "custom_data" JSONB DEFAULT '{}',
    "table_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inv_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_inventory"."inv_warehouses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inv_warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_inventory"."inv_stock" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inv_stock_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "atlas_crm"."crm_customers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "status" TEXT NOT NULL DEFAULT 'LEAD',
    "custom_data" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_crm"."crm_deals" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'QUALIFICATION',
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_crm"."crm_deal_items" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "crm_deal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_hr"."hr_employees" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "employeeCode" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "job_title" TEXT,
    "department_id" TEXT,
    "manager_id" TEXT,
    "employmentType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "hire_date" TIMESTAMP(3) NOT NULL,
    "termination_date" TIMESTAMP(3),
    "custom_data" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_hr"."hr_departments" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "head_employee_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_hr"."hr_leave_requests" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_hr"."hr_leave_balances" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "leave_type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "allocated_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "used_days" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "hr_leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atlas_hr"."hr_payroll_records" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "gross_pay" DOUBLE PRECISION NOT NULL,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_pay" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_payroll_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inv_tables_organization_id_name_key" ON "atlas_inventory"."inv_tables"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "inv_products_organization_id_sku_key" ON "atlas_inventory"."inv_products"("organization_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "inv_stock_product_id_warehouse_id_key" ON "atlas_inventory"."inv_stock"("product_id", "warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_customers_organization_id_email_key" ON "atlas_crm"."crm_customers"("organization_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_user_id_key" ON "atlas_hr"."hr_employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_organization_id_employeeCode_key" ON "atlas_hr"."hr_employees"("organization_id", "employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_organization_id_email_key" ON "atlas_hr"."hr_employees"("organization_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "hr_departments_organization_id_name_key" ON "atlas_hr"."hr_departments"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "hr_leave_balances_employee_id_leave_type_year_key" ON "atlas_hr"."hr_leave_balances"("employee_id", "leave_type", "year");

-- AddForeignKey
ALTER TABLE "atlas_inventory"."inv_products" ADD CONSTRAINT "inv_products_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "atlas_inventory"."inv_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_inventory"."inv_stock" ADD CONSTRAINT "inv_stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "atlas_inventory"."inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_inventory"."inv_stock" ADD CONSTRAINT "inv_stock_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "atlas_inventory"."inv_warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_inventory"."inv_stock_transactions" ADD CONSTRAINT "inv_stock_transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "atlas_inventory"."inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_inventory"."inv_stock_transactions" ADD CONSTRAINT "inv_stock_transactions_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "atlas_inventory"."inv_warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_inventory"."inv_stock_transactions" ADD CONSTRAINT "inv_stock_transactions_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "atlas_inventory"."inv_warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_crm"."crm_deals" ADD CONSTRAINT "crm_deals_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "atlas_crm"."crm_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_crm"."crm_deal_items" ADD CONSTRAINT "crm_deal_items_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "atlas_crm"."crm_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_crm"."crm_deal_items" ADD CONSTRAINT "crm_deal_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "atlas_inventory"."inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_hr"."hr_employees" ADD CONSTRAINT "hr_employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "atlas_hr"."hr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_hr"."hr_employees" ADD CONSTRAINT "hr_employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "atlas_hr"."hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_hr"."hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "atlas_hr"."hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_hr"."hr_leave_balances" ADD CONSTRAINT "hr_leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "atlas_hr"."hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atlas_hr"."hr_payroll_records" ADD CONSTRAINT "hr_payroll_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "atlas_hr"."hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

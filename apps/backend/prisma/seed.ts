import { PrismaClient } from '@prisma/client';

declare const process: any;

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding system permissions...');

  const permissionsData = [
    { code: 'platform.configure', name: 'Configure Platform', description: 'Configure global platform settings', module: 'core' },
    { code: 'plugins.read', name: 'Read Plugins', description: 'View list of installed/active plugins', module: 'core' },
    { code: 'plugins.write', name: 'Manage Plugins', description: 'Install, update, enable, or disable plugins', module: 'core' },
    { code: 'users.read', name: 'Read Users', description: 'View users in the organization', module: 'core' },
    { code: 'users.write', name: 'Manage Users', description: 'Create, update, or deactivate users', module: 'core' },
    { code: 'roles.read', name: 'Read Roles', description: 'View roles and their permissions', module: 'core' },
    { code: 'roles.write', name: 'Manage Roles', description: 'Create, update, or delete roles', module: 'core' },
    { code: 'audit.read', name: 'Read Audit Logs', description: 'View system audit logs', module: 'core' },

    { code: 'inventory.read', name: 'Read Inventory', description: 'View products, warehouses, and stock levels', module: 'inventory' },
    { code: 'inventory.create', name: 'Create Inventory Items', description: 'Add new products and warehouses', module: 'inventory' },
    { code: 'inventory.update', name: 'Update Inventory Items', description: 'Edit products, warehouses, and adjust stock', module: 'inventory' },
    { code: 'inventory.delete', name: 'Delete Inventory Items', description: 'Remove products and warehouses', module: 'inventory' },

    { code: 'crm.read', name: 'Read CRM Data', description: 'View customers and leads', module: 'crm' },
    { code: 'crm.create', name: 'Create CRM Items', description: 'Add new customers and leads', module: 'crm' },
    { code: 'crm.update', name: 'Update CRM Items', description: 'Edit customer and lead details', module: 'crm' },
    { code: 'crm.delete', name: 'Delete CRM Items', description: 'Remove customer and lead records', module: 'crm' },

    { code: 'hr.read', name: 'Read Employees', description: 'View employees', module: 'hr' },
    { code: 'hr.create', name: 'Add Employees/Departments', description: 'Create employees and departments', module: 'hr' },
    { code: 'hr.update', name: 'Edit Employees, Approve/Reject Leave', description: 'Update employees and leave', module: 'hr' },
    { code: 'hr.delete', name: 'Remove Employees/Departments', description: 'Delete employees and departments', module: 'hr' },
    { code: 'hr.payroll.read', name: 'View Payroll Records', description: 'View payroll data', module: 'hr' },
    { code: 'hr.payroll.write', name: 'Create/Process Payroll', description: 'Manage payroll runs', module: 'hr' },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        description: perm.description,
        module: perm.module,
      },
      create: perm,
    });
  }

  console.log(`Seeded ${permissionsData.length} system permissions.`);

  // Create default organization
  console.log('Seeding default organization and admin...');
  const orgId = 'd3b07384-d113-4cd4-a8eb-8418f7e651e2';
  const orgSlug = 'default-org';

  const org = await prisma.organization.upsert({
    where: { slug: orgSlug },
    update: {},
    create: {
      id: orgId,
      name: 'Default Workspace',
      slug: orgSlug,
      status: 'ACTIVE',
      tier: 'enterprise',
      mrr: 199.0,
    },
  });

  const allPermissions = await prisma.permission.findMany();

  // Create default roles
  const superAdminRole = await prisma.role.upsert({
    where: { name_organizationId: { name: 'Super Admin', organizationId: org.id } },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Organization super administrator',
      isSystem: true,
      organizationId: org.id,
      permissions: {
        connect: allPermissions.map((p: any) => ({ id: p.id })),
      },
    },
  });

  const orgAdminRole = await prisma.role.upsert({
    where: { name_organizationId: { name: 'Org Admin', organizationId: org.id } },
    update: {},
    create: {
      name: 'Org Admin',
      description: 'Organization administrator',
      isSystem: true,
      organizationId: org.id,
      permissions: {
        connect: allPermissions
          .filter((p: any) => p.code !== 'platform.configure' && p.code !== 'plugins.write')
          .map((p: any) => ({ id: p.id })),
      },
    },
  });

  await prisma.role.upsert({
    where: { name_organizationId: { name: 'User', organizationId: org.id } },
    update: {},
    create: {
      name: 'User',
      description: 'Standard organization user',
      isSystem: true,
      organizationId: org.id,
      permissions: {
        connect: allPermissions
          .filter((p: any) => p.code.endsWith('.read'))
          .map((p: any) => ({ id: p.id })),
      },
    },
  });

  // Create default admin user (pre-hashed bcrypt for 'password123')
  const adminEmail = 'admin@atlas.com';
  const passwordHash = '$2a$10$d9mc1GrSOijUJdwcZ2AVke3uFvdwGMIb8eWizSe.VpriSsTUb8Ftq';

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: 'a82ea38d-128a-4c28-98de-4752bfa7c588',
      email: adminEmail,
      passwordHash,
      firstName: 'Workspace',
      lastName: 'Admin',
      status: 'ACTIVE',
      hasCompletedSetup: true,
      organizationId: org.id,
      roles: {
        connect: [{ id: superAdminRole.id }, { id: orgAdminRole.id }],
      },
    },
  });

  // Register and enable plugins for default organization
  const pluginIds = ['inventory', 'crm', 'hr', 'analytics', 'project-management'];
  for (const pId of pluginIds) {
    const plugin = await prisma.plugin.upsert({
      where: { id: pId },
      update: {},
      create: {
        id: pId,
        name: pId.charAt(0).toUpperCase() + pId.slice(1) + ' Plugin',
        version: '1.0.0',
        description: `Atlas system plugin for managing ${pId}`,
        status: 'INSTALLED',
      },
    });

    await prisma.organizationPlugin.upsert({
      where: { organizationId_pluginId: { organizationId: org.id, pluginId: plugin.id } },
      update: { status: 'ENABLED' },
      create: {
        organizationId: org.id,
        pluginId: plugin.id,
        status: 'ENABLED',
      },
    });
  }

  // Seed Plugin Data - Raw SQL to prevent compilation schema locks
  console.log('Seeding mock data for plugins (Inventory, CRM, HR)...');

  try {
    // 1. Inventory mock data
    const tableId = 'sample-table-id-1111';
    const warehouseId = 'sample-warehouse-id-1111';
    const p1Id = 'sample-product-id-1111';
    const p2Id = 'sample-product-id-2222';
    const p3Id = 'sample-product-id-3333';

    await prisma.$executeRawUnsafe(`
      INSERT INTO "atlas_inventory"."inv_tables" ("id", "organization_id", "name", "fieldSchema", "created_at", "updated_at")
      VALUES ('${tableId}', '${org.id}', 'Main Catalog', '[]', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "atlas_inventory"."inv_products" ("id", "organization_id", "name", "sku", "base_price", "custom_data", "table_id", "created_at", "updated_at")
      VALUES 
        ('${p1Id}', '${org.id}', 'Enterprise Server Shelf', 'ENT-SRV-01', 1250.00, '{}', '${tableId}', NOW(), NOW()),
        ('${p2Id}', '${org.id}', 'Gigabit Ethernet Switch 24P', 'NET-SW-24', 350.00, '{}', '${tableId}', NOW(), NOW()),
        ('${p3Id}', '${org.id}', 'Fiber Optic Transceiver', 'NET-FIB-TR', 85.00, '{}', '${tableId}', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "atlas_inventory"."inv_warehouses" ("id", "organization_id", "name", "location", "created_at", "updated_at")
      VALUES ('${warehouseId}', '${org.id}', 'Default Warehouse', 'Primary Storage', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "atlas_inventory"."inv_stock" ("id", "organization_id", "product_id", "warehouse_id", "quantity", "created_at", "updated_at")
      VALUES 
        ('stock-1', '${org.id}', '${p1Id}', '${warehouseId}', 15, NOW(), NOW()),
        ('stock-2', '${org.id}', '${p2Id}', '${warehouseId}', 8, NOW(), NOW()),
        ('stock-3', '${org.id}', '${p3Id}', '${warehouseId}', 55, NOW(), NOW())
      ON CONFLICT ("product_id", "warehouse_id") DO UPDATE SET "quantity" = EXCLUDED.quantity;
    `);

    // 2. CRM mock data
    const c1Id = 'sample-customer-id-1111';
    const c2Id = 'sample-customer-id-2222';
    const d1Id = 'sample-deal-id-1111';
    const d2Id = 'sample-deal-id-2222';

    await prisma.$executeRawUnsafe(`
      INSERT INTO "atlas_crm"."crm_customers" ("id", "organization_id", "name", "email", "phone", "company", "status", "custom_data", "created_at", "updated_at")
      VALUES 
        ('${c1Id}', '${org.id}', 'Acme Corporation', 'contact@acme.com', '+1-555-0199', 'Acme Corp', 'PROSPECT', '{}', NOW(), NOW()),
        ('${c2Id}', '${org.id}', 'Stark Industries', 'tony@stark.com', '+1-555-4321', 'Stark Industries', 'CUSTOMER', '{}', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "atlas_crm"."crm_deals" ("id", "organization_id", "title", "customer_id", "stage", "value", "created_at", "updated_at")
      VALUES 
        ('${d1Id}', '${org.id}', 'Acme Switch Upgrade', '${c1Id}', 'NEGOTIATION', 3500.00, NOW(), NOW()),
        ('${d2Id}', '${org.id}', 'Stark Tech Support', '${c2Id}', 'CLOSED_WON', 12000.00, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    // 3. HR mock data
    const deptId = 'sample-dept-id-1111';
    const empId = 'sample-employee-id-1111';

    await prisma.$executeRawUnsafe(`
      INSERT INTO "atlas_hr"."hr_departments" ("id", "organization_id", "name", "head_employee_id", "created_at", "updated_at")
      VALUES ('${deptId}', '${org.id}', 'Engineering', NULL, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "atlas_hr"."hr_employees" ("id", "organization_id", "user_id", "employeeCode", "first_name", "last_name", "email", "phone", "job_title", "department_id", "manager_id", "employmentType", "status", "hire_date", "created_at", "updated_at")
      VALUES ('${empId}', '${org.id}', NULL, 'EMP-0001', 'John', 'Doe', 'john.doe@company.com', '+1-555-2222', 'Senior Engineer', '${deptId}', NULL, 'FULL_TIME', 'ACTIVE', NOW(), NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    console.log('Mock database data seeded successfully.');

  } catch (err) {
    console.warn('Warning: Some mock tables could not be seeded. Ensure the respective migrations have been run.');
    console.error(err);
  }

  console.log(`\n--------------------------------------------`);
  console.log(`Atlas platform seed completed successfully!`);
  console.log(`Admin Portal: http://localhost:5173`);
  console.log(`Login Email: ${adminEmail}`);
  console.log(`Login Password: password123`);
  console.log(`--------------------------------------------\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

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
  console.log('Done. Sign up at the saas-portal to create your first workspace.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

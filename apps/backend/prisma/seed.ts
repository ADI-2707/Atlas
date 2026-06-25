import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'atlas' },
    update: {},
    create: {
      name: 'Atlas Enterprise',
      slug: 'atlas',
      status: 'ACTIVE',
    },
  });
  console.log(`Created organization: ${org.name} (${org.id})`);

  // 2. Define Permissions
  const permissionsData = [
    // Core Platform
    { code: 'platform.configure', name: 'Configure Platform', description: 'Configure global platform settings', module: 'core' },
    { code: 'plugins.read', name: 'Read Plugins', description: 'View list of installed/active plugins', module: 'core' },
    { code: 'plugins.write', name: 'Manage Plugins', description: 'Install, update, enable, or disable plugins', module: 'core' },
    { code: 'users.read', name: 'Read Users', description: 'View users in the organization', module: 'core' },
    { code: 'users.write', name: 'Manage Users', description: 'Create, update, or deactivate users', module: 'core' },
    { code: 'roles.read', name: 'Read Roles', description: 'View roles and their permissions', module: 'core' },
    { code: 'roles.write', name: 'Manage Roles', description: 'Create, update, or delete roles', module: 'core' },
    { code: 'audit.read', name: 'Read Audit Logs', description: 'View system audit logs', module: 'core' },
    
    // Inventory Plugin
    { code: 'inventory.read', name: 'Read Inventory', description: 'View products, warehouses, and stock levels', module: 'inventory' },
    { code: 'inventory.create', name: 'Create Inventory Items', description: 'Add new products and warehouses', module: 'inventory' },
    { code: 'inventory.update', name: 'Update Inventory Items', description: 'Edit products, warehouses, and adjust stock', module: 'inventory' },
    { code: 'inventory.delete', name: 'Delete Inventory Items', description: 'Remove products and warehouses', module: 'inventory' },
    
    // CRM Plugin
    { code: 'crm.read', name: 'Read CRM Data', description: 'View customers and leads', module: 'crm' },
    { code: 'crm.create', name: 'Create CRM Items', description: 'Add new customers and leads', module: 'crm' },
    { code: 'crm.update', name: 'Update CRM Items', description: 'Edit customer and lead details', module: 'crm' },
    { code: 'crm.delete', name: 'Delete CRM Items', description: 'Remove customer and lead records', module: 'crm' },
  ];

  const dbPermissions = [];
  for (const perm of permissionsData) {
    const dbPerm = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        description: perm.description,
        module: perm.module,
      },
      create: perm,
    });
    dbPermissions.push(dbPerm);
  }
  console.log(`Seeded ${dbPermissions.length} permissions.`);

  // 3. Define Roles
  // Super Admin (Global / Platform level)
  const superAdminRole = await prisma.role.upsert({
    where: { name_organizationId: { name: 'Super Admin', organizationId: org.id } },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Platform super administrator with unrestricted access',
      isSystem: true,
      organizationId: org.id,
      permissions: {
        connect: dbPermissions.map(p => ({ id: p.id })),
      },
    },
  });
  console.log(`Created role: ${superAdminRole.name}`);

  // Organization Admin
  const orgAdminRole = await prisma.role.upsert({
    where: { name_organizationId: { name: 'Org Admin', organizationId: org.id } },
    update: {},
    create: {
      name: 'Org Admin',
      description: 'Organization administrator with management capabilities',
      isSystem: true,
      organizationId: org.id,
      permissions: {
        connect: dbPermissions
          .filter(p => p.code !== 'platform.configure' && p.code !== 'plugins.write')
          .map(p => ({ id: p.id })),
      },
    },
  });
  console.log(`Created role: ${orgAdminRole.name}`);

  // Standard User
  const userRole = await prisma.role.upsert({
    where: { name_organizationId: { name: 'User', organizationId: org.id } },
    update: {},
    create: {
      name: 'User',
      description: 'Standard organization user with read-only access',
      isSystem: true,
      organizationId: org.id,
      permissions: {
        connect: dbPermissions
          .filter(p => p.code.endsWith('.read'))
          .map(p => ({ id: p.id })),
      },
    },
  });
  console.log(`Created role: ${userRole.name}`);

  // 4. Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@atlas.com' },
    update: {
      passwordHash,
    },
    create: {
      email: 'admin@atlas.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      status: 'ACTIVE',
      organizationId: org.id,
      roles: {
        connect: [
          { id: superAdminRole.id },
          { id: orgAdminRole.id },
        ],
      },
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

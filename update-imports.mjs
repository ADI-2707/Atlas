import fs from 'fs';

const files = [
  'apps/frontend/src/App.tsx',
  'apps/frontend/src/components/Layout/AppLayout.tsx',
  'apps/frontend/src/pages/Dashboard/Dashboard.tsx',
  'apps/frontend/src/pages/Store/PluginStore.tsx',
  'apps/frontend/src/pages/Welcome/Welcome.tsx',
  'plugins/inventory/frontend/src/pages/InventoryDashboard.tsx',
  'plugins/project-management/frontend/src/pages/ProjectManagement.tsx',
  'apps/frontend/src/pages/Setup/Setup.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from\s+['"].*?contexts\/ThemeContext['"]/g, "from '@atlas/core-ui'");
  content = content.replace(/from\s+['"].*?contexts\/PluginContext['"]/g, "from '@atlas/core-ui'");
  content = content.replace(/from\s+['"].*?plugins\/mock-plugins['"]/g, "from '@atlas/core-ui'");
  
  fs.writeFileSync(file, content);
}

const packageJsons = [
  'apps/frontend/package.json',
  'plugins/inventory/package.json',
  'plugins/project-management/package.json'
];

for (const pkgFile of packageJsons) {
  if (!fs.existsSync(pkgFile)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  if (!pkg.dependencies) pkg.dependencies = {};
  pkg.dependencies['@atlas/core-ui'] = 'workspace:*';
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
}

// Remove old files
const oldFiles = [
  'apps/frontend/src/contexts/ThemeContext.tsx',
  'apps/frontend/src/contexts/PluginContext.tsx',
  'apps/frontend/src/plugins/mock-plugins.ts'
];

for (const file of oldFiles) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}

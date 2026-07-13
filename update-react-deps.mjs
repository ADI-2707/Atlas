import fs from 'fs';
import path from 'path';

// 1. Update root package.json
const rootPkgPath = path.resolve('package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
if (!rootPkg.pnpm) rootPkg.pnpm = {};
if (!rootPkg.pnpm.overrides) rootPkg.pnpm.overrides = {};
rootPkg.pnpm.overrides['react'] = '18.3.1';
rootPkg.pnpm.overrides['react-dom'] = '18.3.1';
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');

// 2. Move react/react-dom to peerDependencies in plugins
const pluginsDir = path.resolve('plugins');
const plugins = fs.readdirSync(pluginsDir);

for (const plugin of plugins) {
  const pluginPkgPath = path.join(pluginsDir, plugin, 'package.json');
  if (fs.existsSync(pluginPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pluginPkgPath, 'utf8'));
    let changed = false;

    if (!pkg.peerDependencies) pkg.peerDependencies = {};

    if (pkg.dependencies && pkg.dependencies['react']) {
      pkg.peerDependencies['react'] = pkg.dependencies['react'];
      delete pkg.dependencies['react'];
      changed = true;
    }
    if (pkg.dependencies && pkg.dependencies['react-dom']) {
      pkg.peerDependencies['react-dom'] = pkg.dependencies['react-dom'];
      delete pkg.dependencies['react-dom'];
      changed = true;
    }

    if (pkg.devDependencies && pkg.devDependencies['react']) {
      pkg.peerDependencies['react'] = pkg.devDependencies['react'];
      delete pkg.devDependencies['react'];
      changed = true;
    }
    if (pkg.devDependencies && pkg.devDependencies['react-dom']) {
      pkg.peerDependencies['react-dom'] = pkg.devDependencies['react-dom'];
      delete pkg.devDependencies['react-dom'];
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(pluginPkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`Updated ${pluginPkgPath}`);
    }
  }
}

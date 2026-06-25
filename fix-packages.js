const fs = require('fs');
const path = require('path');

function updatePackageJson(dir, isPlugin = false) {
    const pkgPath = path.join(dir, 'package.json');
    if (!fs.existsSync(pkgPath)) return;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    if (isPlugin) {
        pkg.main = 'dist/backend/src/index.js';
        pkg.types = 'dist/backend/src/index.d.ts';
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.build = 'tsc';
    } else {
        pkg.main = 'dist/index.js';
        pkg.types = 'dist/index.d.ts';
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.build = 'tsc';
    }

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Updated ${pkgPath}`);
}

const packagesDir = path.join(__dirname, 'packages');
const pluginsDir = path.join(__dirname, 'plugins');

fs.readdirSync(packagesDir).forEach(p => {
    updatePackageJson(path.join(packagesDir, p), false);
});

fs.readdirSync(pluginsDir).forEach(p => {
    updatePackageJson(path.join(pluginsDir, p), true);
});

// Update root package.json build script
const rootPkgPath = path.join(__dirname, 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
rootPkg.scripts.build = "pnpm --filter './packages/*' build && pnpm --filter './plugins/*' build && pnpm --filter './apps/*' build";
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');
console.log('Updated root package.json');

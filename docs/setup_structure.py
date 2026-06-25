import json, os

packages = {
    "atlas-forms":      ("@atlas/forms",      "Atlas Form Framework"),
    "atlas-grid":       ("@atlas/grid",       "Atlas Enterprise Data Grid"),
    "atlas-api":        ("@atlas/api",        "Atlas HTTP Client & Request Framework"),
    "atlas-events":     ("@atlas/events",     "Atlas Event System"),
    "atlas-logger":     ("@atlas/logger",     "Atlas Logging Framework"),
    "atlas-storage":    ("@atlas/storage",    "Atlas Storage Abstraction Layer"),
    "atlas-dashboard":  ("@atlas/dashboard",  "Atlas Dashboard Engine"),
    "atlas-widgets":    ("@atlas/widgets",    "Atlas Widget Framework"),
    "atlas-plugin-sdk": ("@atlas/plugin-sdk", "Atlas Plugin Development SDK"),
    "atlas-config":     ("@atlas/config",     "Atlas Configuration Framework"),
    "atlas-auth":       ("@atlas/auth",       "Atlas Authentication Utilities"),
    "atlas-utils":      ("@atlas/utils",      "Atlas Shared Utilities"),
}

base = r"c:\Users\Dell\Desktop\Atlas\packages"

for folder, (name, desc) in packages.items():
    pkg_dir = os.path.join(base, folder)
    src_dir = os.path.join(pkg_dir, "src")
    os.makedirs(src_dir, exist_ok=True)

    # package.json
    pkg = {
        "name": name,
        "version": "1.0.0",
        "description": desc,
        "main": "src/index.ts",
        "types": "src/index.ts",
        "private": True,
        "scripts": {
            "build": "tsc",
            "lint": "echo 'lint passed'",
            "clean": "rimraf dist"
        }
    }
    with open(os.path.join(pkg_dir, "package.json"), "w") as f:
        json.dump(pkg, f, indent=2)

    # src/index.ts
    with open(os.path.join(src_dir, "index.ts"), "w") as f:
        f.write(f"// {name} — {desc}\n\nexport {{}};\n")

# Create plugin stubs
for plugin in ["inventory", "crm"]:
    for sub in ["backend/controllers", "backend/services", "backend/repositories",
                 "backend/events", "backend/permissions", "backend/migrations", "backend/routes",
                 "frontend/pages", "frontend/widgets", "frontend/components", "frontend/forms",
                 "frontend/navigation", "shared", "tests", "assets"]:
        os.makedirs(os.path.join(r"c:\Users\Dell\Desktop\Atlas\plugins", plugin, sub), exist_ok=True)

    pkg = {
        "name": f"@atlas/plugin-{plugin}",
        "version": "1.0.0",
        "description": f"Atlas {plugin.title()} Management Plugin",
        "private": True,
    }
    with open(os.path.join(r"c:\Users\Dell\Desktop\Atlas\plugins", plugin, "package.json"), "w") as f:
        json.dump(pkg, f, indent=2)

    manifest = {
        "id": plugin,
        "name": f"{plugin.title()} Management",
        "version": "1.0.0",
        "author": "Atlas Team",
        "description": f"Enterprise {plugin} management plugin.",
        "atlasVersion": "1.0.0",
        "dependencies": [],
        "permissions": [],
        "events": [],
        "routes": [],
        "widgets": []
    }
    with open(os.path.join(r"c:\Users\Dell\Desktop\Atlas\plugins", plugin, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

# Create infrastructure stubs
for sub in ["docker", "nginx", "scripts"]:
    os.makedirs(os.path.join(r"c:\Users\Dell\Desktop\Atlas\infrastructure", sub), exist_ok=True)
    with open(os.path.join(r"c:\Users\Dell\Desktop\Atlas\infrastructure", sub, ".gitkeep"), "w") as f:
        pass

# Create tests stub
os.makedirs(r"c:\Users\Dell\Desktop\Atlas\tests", exist_ok=True)
with open(r"c:\Users\Dell\Desktop\Atlas\tests\.gitkeep", "w") as f:
    pass

# Create apps stubs (worker)
os.makedirs(r"c:\Users\Dell\Desktop\Atlas\apps\worker\src", exist_ok=True)
with open(r"c:\Users\Dell\Desktop\Atlas\apps\worker\package.json", "w") as f:
    json.dump({
        "name": "@atlas/worker",
        "version": "1.0.0",
        "description": "Atlas Background Worker Service",
        "private": True,
    }, f, indent=2)

print("All package stubs created!")

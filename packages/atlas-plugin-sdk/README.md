# `@atlas/plugin-sdk`

Contract, manifests, lifecycle hooks, and type specifications for authoring independently deployable business plugins.

---

## Installation

```bash
pnpm add @atlas/plugin-sdk
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { AtlasPlugin } from '@atlas/plugin-sdk';

export default AtlasPlugin({
  id: 'inventory',
  name: 'Inventory Management',
  version: '1.0.0',
  lifecycle: {
    onEnable: async (ctx) => {
      /* bootstrap schema */
    },
    onDisable: async (ctx) => {
      /* teardown schema */
    },
  },
});
```

---

## Directory Shape

```
atlas-plugin-sdk/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

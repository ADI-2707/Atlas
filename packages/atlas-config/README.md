# `@atlas/config`

Central configuration and feature-flag framework for toggling app features and plugin tiers dynamically.

---

## Installation

```bash
pnpm add @atlas/config
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { configManager } from '@atlas/config';

const isFeatureEnabled = configManager.get('features.newBilling', false);
if (isFeatureEnabled) {
  // execute new billing logic
}
```

---

## Directory Shape

```
atlas-config/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

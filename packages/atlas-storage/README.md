# `@atlas/storage`

Storage abstraction interface separating local directory assets from S3 bucket asset structures.

---

## Installation

```bash
pnpm add @atlas/storage
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { storage } from '@atlas/storage';

// Upload a CSV profile sheet
const assetUrl = await storage.put('profile.csv', csvContent);
console.log('Saved to storage:', assetUrl);
```

---

## Directory Shape

```
atlas-storage/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

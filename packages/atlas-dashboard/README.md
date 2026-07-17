# `@atlas/dashboard`

Dashboard engine supporting drag-and-drop widget layouts and custom position persistence state.

---

## Installation

```bash
pnpm add @atlas/dashboard
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { DashboardEngine } from '@atlas/dashboard';

const initialLayout = [{ i: 'widget-1', x: 0, y: 0, w: 6, h: 4 }];

function Dashboard() {
  return (
    <DashboardEngine
      layout={initialLayout}
      onLayoutChange={(newLayout) => saveLayout(newLayout)}
    />
  );
}
```

---

## Directory Shape

```
atlas-dashboard/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

# `@atlas/widgets`

Widget framework registry containing pre-designed metrics cards, KPI grids, and charts components.

---

## Installation

```bash
pnpm add @atlas/widgets
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { MetricWidget } from '@atlas/widgets';

function Grid() {
  return (
    <MetricWidget
      title="Monthly MRR"
      value={199.00}
      format="currency"
      change={12.5}
    />
  );
}
```

---

## Directory Shape

```
atlas-widgets/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

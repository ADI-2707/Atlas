# `@atlas/grid`

Virtualized enterprise grid supporting column sorting, filtering, and large list pagination.

---

## Installation

```bash
pnpm add @atlas/grid
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { DataGrid } from '@atlas/grid';

const columns = [
  { key: 'sku', name: 'SKU' },
  { key: 'name', name: 'Product Name' }
];

function List({ products }) {
  return (
    <DataGrid columns={columns} rows={products} paginate={true} />
  );
}
```

---

## Directory Shape

```
atlas-grid/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

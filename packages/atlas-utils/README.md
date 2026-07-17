# `@atlas/utils`

Utility library providing formatters, validaters, UUID managers, and pagination calculators.

---

## Installation

```bash
pnpm add @atlas/utils
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { formatDate, formatCurrency, slugify } from '@atlas/utils';

const dateStr = formatDate(new Date());
const moneyStr = formatCurrency(1250); // $1,250.00
const slug = slugify('Acme Corporation Inc.'); // acme-corporation-inc
```

---

## Directory Shape

```
atlas-utils/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

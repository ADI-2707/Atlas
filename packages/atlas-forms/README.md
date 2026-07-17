# `@atlas/forms`

Schema-driven form generator validating complex nested layouts natively.

---

## Installation

```bash
pnpm add @atlas/forms
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { FormBuilder } from '@atlas/forms';

const productSchema = {
  name: { type: 'string', required: true },
  sku: { type: 'string', required: true }
};

function Form() {
  return (
    <FormBuilder schema={productSchema} onSubmit={handleSubmit} />
  );
}
```

---

## Directory Shape

```
atlas-forms/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

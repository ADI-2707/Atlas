# `@atlas/ui`

Enterprise components library containing buttons, modals, cards, badges, and shared design CSS tokens.

---

## Installation

```bash
pnpm add @atlas/ui
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { Button, Card, Modal } from '@atlas/ui';
import '@atlas/ui/dist/design-tokens.css';

function Main() {
  return (
    <Card>
      <h2>Atlas Component</h2>
      <Button variant="primary">Submit Details</Button>
    </Card>
  );
}
```

---

## Directory Shape

```
atlas-ui/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

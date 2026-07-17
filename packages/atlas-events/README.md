# `@atlas/events`

In-process event bus for decoupled asynchronous cross-plugin and cross-module communication.

---

## Installation

```bash
pnpm add @atlas/events
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { eventBus } from '@atlas/events';

// Subscribe to a stock transaction update event
eventBus.on('stock.updated', (event) => {
  console.log('Stock altered:', event.quantity);
});

// Emit event from inventory module
eventBus.emit('stock.updated', { productId: 'p1', quantity: 15 });
```

---

## Directory Shape

```
atlas-events/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

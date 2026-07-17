# `@atlas/logger`

Structured logger mapping contexts, levels, and metadata to PostgreSQL audit logging tables.

---

## Installation

```bash
pnpm add @atlas/logger
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { AtlasLogger, LogLevel } from '@atlas/logger';

const logger = new AtlasLogger({ level: LogLevel.INFO, context: 'CRMService' });
logger.info('Customer list exported', { customerCount: 42 });
```

---

## Directory Shape

```
atlas-logger/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

# `@atlas/api`

Lightweight Fetch HTTP Client Wrapper supporting request and response interceptors and automatic JWT 401 refresh retry logic.

---

## Installation

```bash
pnpm add @atlas/api
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { api } from '@atlas/api';

// Intercept requests (e.g. attach token)
api.addRequestInterceptor((config) => {
  config.headers['Authorization'] = 'Bearer <token>';
  return config;
});

// Perform GET request
const response = await api.get('/organizations');
```

---

## Directory Shape

```
atlas-api/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

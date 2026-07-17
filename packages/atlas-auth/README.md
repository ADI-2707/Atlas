# `@atlas/auth`

React Authentication Context Provider, JWT token storage, and ProtectedRoute components for tenant workspaces.

---

## Installation

```bash
pnpm add @atlas/auth
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { AuthProvider, ProtectedRoute } from '@atlas/auth';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute path="/dashboard" component={Dashboard} />
    </AuthProvider>
  );
}
```

---

## Directory Shape

```
atlas-auth/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

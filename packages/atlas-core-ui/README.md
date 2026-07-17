# `@atlas/core-ui`

Core UI Layout shells, top navigation bars, and workspace sidebar wrappers.

---

## Installation

```bash
pnpm add @atlas/core-ui
```

---

## Core Features

- **Decoupled Monorepo Integration:** Published under workspace boundaries.
- **Enterprise-focused Interface:** Tailored for consistent UI component rendering.
- **Strictly Typed:** Fully authored in TypeScript.

---

## Usage

```typescript
import { WorkspaceLayout } from '@atlas/core-ui';

function Page() {
  return (
    <WorkspaceLayout sidebarItems={navItems} theme="dark">
      <Content />
    </WorkspaceLayout>
  );
}
```

---

## Directory Shape

```
atlas-core-ui/
├── package.json
└── src/
    └── index.ts      # Main package exports
```

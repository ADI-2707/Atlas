# `packages/`

This directory is the **Atlas Framework Layer** — shared libraries that every app (`saas-portal`, `frontend`, `backend`) and every plugin build on top of. Keeping this code here, instead of duplicating it per plugin, is what lets new plugins look, feel, and behave consistently and ship faster.

Each package is published internally as `@atlas/<name>` and consumed via the pnpm workspace (no publishing to npm required).

---

## Workspace Package Index

Each package contains its own dedicated documentation:

| Package            | Import              | Documentation                                            | Status         | Purpose                                                    |
| ------------------ | ------------------- | -------------------------------------------------------- | -------------- | ---------------------------------------------------------- |
| `atlas-api`        | `@atlas/api`        | [atlas-api/README.md](atlas-api/README.md)               | ✅ Implemented | HTTP client with interceptors, used to talk to the backend |
| `atlas-auth`       | `@atlas/auth`       | [atlas-auth/README.md](atlas-auth/README.md)             | ✅ Implemented | React auth context, protected routes, token storage        |
| `atlas-ui`         | `@atlas/ui`         | [atlas-ui/README.md](atlas-ui/README.md)                 | ✅ Implemented | Enterprise UI component library                            |
| `atlas-events`     | `@atlas/events`     | [atlas-events/README.md](atlas-events/README.md)         | ✅ Implemented | In-process event bus for cross-plugin communication        |
| `atlas-logger`     | `@atlas/logger`     | [atlas-logger/README.md](atlas-logger/README.md)         | ✅ Implemented | Structured logging utility                                 |
| `atlas-plugin-sdk` | `@atlas/plugin-sdk` | [atlas-plugin-sdk/README.md](atlas-plugin-sdk/README.md) | ✅ Implemented | Types & helpers for authoring a plugin                     |
| `atlas-utils`      | `@atlas/utils`      | [atlas-utils/README.md](atlas-utils/README.md)           | ✅ Implemented | Shared formatting, validation & pagination helpers         |
| `atlas-config`     | `@atlas/config`     | [atlas-config/README.md](atlas-config/README.md)         | ✅ Implemented | Singleton config manager & feature flag system             |
| `atlas-core-ui`    | `@atlas/core-ui`    | [atlas-core-ui/README.md](atlas-core-ui/README.md)       | ✅ Implemented | Core layout modules and panels                             |
| `atlas-dashboard`  | `@atlas/dashboard`  | [atlas-dashboard/README.md](atlas-dashboard/README.md)   | ✅ Implemented | Drag-and-drop dashboard engine (react-grid-layout)         |
| `atlas-forms`      | `@atlas/forms`      | [atlas-forms/README.md](atlas-forms/README.md)           | ✅ Implemented | Schema-driven form builder (react-hook-form + Zod)         |
| `atlas-grid`       | `@atlas/grid`       | [atlas-grid/README.md](atlas-grid/README.md)             | ✅ Implemented | Sortable, paginated enterprise data grid                   |
| `atlas-storage`    | `@atlas/storage`    | [atlas-storage/README.md](atlas-storage/README.md)       | ✅ Implemented | File storage abstraction with pluggable providers           |
| `atlas-widgets`    | `@atlas/widgets`    | [atlas-widgets/README.md](atlas-widgets/README.md)       | ✅ Implemented | Widget registry framework for dashboard plugins            |

---

## Adding a new package

```bash
mkdir packages/atlas-<name>
cd packages/atlas-<name>
pnpm init
```

Set the package name to `@atlas/<name>`, add it to `pnpm-workspace.yaml` if not auto-detected, and export its public API from `src/index.ts`. Apps consume it via the workspace protocol — no build/publish step is required for local development.

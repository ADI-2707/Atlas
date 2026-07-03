# `packages/`

This directory is the **Atlas Framework Layer** — shared libraries that every app (`saas-portal`, `frontend`, `backend`) and every plugin build on top of. Keeping this code here, instead of duplicating it per plugin, is what lets new plugins look, feel, and behave consistently and ship faster.

Each package is published internally as `@atlas/<name>` and consumed via the pnpm workspace (no publishing to npm required).

| Package | Import | Status | Purpose |
|---|---|---|---|
| [`atlas-api`](#atlas-api) | `@atlas/api` | ✅ Implemented | HTTP client with interceptors, used to talk to the backend |
| [`atlas-auth`](#atlas-auth) | `@atlas/auth` | ✅ Implemented | React auth context, protected routes, token storage |
| [`atlas-ui`](#atlas-ui) | `@atlas/ui` | ✅ Implemented | Enterprise UI component library |
| [`atlas-events`](#atlas-events) | `@atlas/events` | ✅ Implemented | In-process event bus for cross-plugin communication |
| [`atlas-logger`](#atlas-logger) | `@atlas/logger` | ✅ Implemented | Structured logging utility |
| [`atlas-plugin-sdk`](#atlas-plugin-sdk) | `@atlas/plugin-sdk` | ✅ Implemented | Types & helpers for authoring a plugin |
| [`atlas-utils`](#atlas-utils) | `@atlas/utils` | ✅ Implemented | Shared formatting, validation & pagination helpers |
| [`atlas-config`](#scaffolded-packages) | `@atlas/config` | 🚧 Scaffolded | Configuration framework — not yet implemented |
| [`atlas-dashboard`](#scaffolded-packages) | `@atlas/dashboard` | 🚧 Scaffolded | Dashboard engine — not yet implemented |
| [`atlas-forms`](#scaffolded-packages) | `@atlas/forms` | 🚧 Scaffolded | Form framework — not yet implemented |
| [`atlas-grid`](#scaffolded-packages) | `@atlas/grid` | 🚧 Scaffolded | Enterprise data grid — not yet implemented |
| [`atlas-storage`](#scaffolded-packages) | `@atlas/storage` | 🚧 Scaffolded | Storage abstraction layer — not yet implemented |
| [`atlas-widgets`](#scaffolded-packages) | `@atlas/widgets` | 🚧 Scaffolded | Dashboard widget framework — not yet implemented |

---

## `atlas-api`

A lightweight, dependency-free HTTP client (`AtlasApi`) wrapping `fetch`, with support for request/response interceptors and automatic retry hooks — used to attach auth tokens and handle 401 refresh flows consistently across every app.

```ts
import { api } from '@atlas/api';

api.addRequestInterceptor((config) => {
  // attach auth token, etc.
  return config;
});

const orgs = await api.get('/organizations');
```

---

## `atlas-auth`

React-side authentication layer shared by `frontend` and any plugin UI. Peer-depends on React 18.

- `AuthProvider.tsx` — auth context provider (session/user state)
- `ProtectedRoute.tsx` — route guard for authenticated pages
- `TokenStorage.ts` — access/refresh token persistence

```tsx
import { AuthProvider, ProtectedRoute } from '@atlas/auth';
```

---

## `atlas-ui`

The enterprise component library plugins and apps use to stay visually consistent, plus a shared `design-tokens.css`. Peer-depends on React 18.

Components currently included:

```
Button · Card · Badge · Checkbox · Input · Loader
Modal · Navbar · Pagination · Sidebar · Toast
```

Also ships a `useDebounce` hook.

```tsx
import { Button, Modal, Card } from '@atlas/ui';
import '@atlas/ui/dist/design-tokens.css';
```

---

## `atlas-events`

A minimal, dependency-free `EventBus` used for cross-plugin and cross-module communication without tight coupling — e.g. the `inventory` plugin can emit a `stock.updated` event that the `analytics` plugin listens for, without either importing the other.

```ts
import { eventBus } from '@atlas/events';

eventBus.on('stock.updated', (event) => { /* ... */ });
eventBus.emit('stock.updated', { productId, quantity });
```

---

## `atlas-logger`

A structured logger (`AtlasLogger`) with configurable log levels, shared across backend services so log output is consistent regardless of which module or plugin emits it.

```ts
import { AtlasLogger, LogLevel } from '@atlas/logger';

const logger = new AtlasLogger({ level: LogLevel.INFO, context: 'PluginManager' });
logger.info('Plugin registered', { pluginId: 'crm' });
```

---

## `atlas-plugin-sdk`

The contract every plugin is built against. Defines the shape of a plugin's `manifest.json` and its runtime config, which is what the backend's Plugin Manager (`apps/backend/src/plugins`) reads to discover, register, and expose a plugin to organizations.

Key exports:
- `PluginManifest` — id, name, version, permissions, routes, widgets, events
- `PluginRoute`, `PluginNavigationItem`, `PluginWidget`, `PluginEventConfig`
- `PluginConfigurationSchema`, `PluginLifecycle`
- `AtlasPlugin(config)` — helper to define a plugin's runtime configuration

```ts
import { AtlasPlugin } from '@atlas/plugin-sdk';

export default AtlasPlugin({
  id: 'crm',
  routes: [/* ... */],
  lifecycle: { onEnable, onDisable },
});
```

---

## `atlas-utils`

Framework-agnostic helpers shared by both frontend and backend code:

- `formatDate`, `formatCurrency`
- `isValidEmail`, `isUUID`, `generateUUID`
- `slugify`, `isObject`
- `getPaginationParams`, `buildPaginatedResult<T>` — standard pagination shape used across every list endpoint in the API

---

## Scaffolded packages

The following packages exist as workspace entries (with `package.json` and an empty `src/index.ts`) but have **no implementation yet**. They're reserved so plugins and apps can be written against a stable import path (`@atlas/forms`, `@atlas/grid`, etc.) as these are built out, without a breaking rename later:

- **`atlas-config`** — planned central configuration/feature-flag framework
- **`atlas-dashboard`** — planned dashboard layout/engine (grid of widgets, layout persistence)
- **`atlas-forms`** — planned schema-driven form framework
- **`atlas-grid`** — planned enterprise data grid (sorting, filtering, virtualization)
- **`atlas-storage`** — planned storage abstraction (local disk / S3-compatible backends)
- **`atlas-widgets`** — planned widget framework consumed by `atlas-dashboard`

If you're picking up one of these, check for an open issue first — several are likely mid-flight.

---

## Adding a new package

```bash
mkdir packages/atlas-<name>
cd packages/atlas-<name>
pnpm init
```

Set the package name to `@atlas/<name>`, add it to `pnpm-workspace.yaml` if not auto-detected, and export its public API from `src/index.ts`. Apps consume it via the workspace protocol — no build/publish step is required for local development.

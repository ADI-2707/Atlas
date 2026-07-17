# `apps/backend`

The Atlas core platform API — a NestJS service that owns authentication, organizations, users, roles/permissions, plugin registration, and auditing for every tenant. All plugin backends (`plugins/*/backend`) are loaded into this same process by the Plugin Manager.

- **Framework:** NestJS 10 + TypeScript
- **ORM:** Prisma 5 (multi-schema Postgres)
- **Auth:** JWT (access + refresh), session-backed
- **API prefix:** `/api/v1`
- **Docs:** Swagger UI at `/docs` (generated from `main.ts`)
- **Default port:** `3000` (`APP_PORT` env var)

---

## Swagger UI Documentation

Atlas compiles and publishes dynamic REST API schemas using NestJS Swagger integration. When running locally, browse to `http://localhost:3000/docs` to view and interact with endpoints.

---

## Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # multi-schema data model (see below)
│   ├── migrations/
│   └── seed.ts
└── src/
    ├── main.ts             # bootstrap, CORS, Swagger, global pipes/filters
    ├── app.module.ts        # root module — wires every feature module together
    ├── auth/                 # register/login/refresh/logout, JWT strategy, RBAC guards
    ├── users/                 # user CRUD, scoped to the caller's organization
    ├── roles/                 # role & permission management
    ├── plugins/                # Plugin Manager — discovery, install/enable/disable
    ├── admin/                  # platform-level (cross-tenant) admin endpoints
    ├── audit/                  # audit log read/write + support tickets
    ├── health/                 # health check endpoint
    ├── prisma/                  # PrismaService/PrismaModule
    └── common/                   # global exception filter & response interceptor
```

---

## Data model

Prisma's `multiSchema` preview feature is used to keep each domain in its own Postgres schema while still sharing one database and one `Organization` as the tenant boundary:

| Schema            | Models                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atlas_core`      | `Organization`, `User`, `Role`, `Permission`, `Session`, `Plugin`, `AuditLog`, `SystemLog`, `SupportTicket`                                                |
| `atlas_inventory` | `InventoryTable`, `Product`, `Warehouse`, `Stock`, `StockTransaction` (Mapped from [inventory plugin](../../plugins/inventory/README.md))                  |
| `atlas_crm`       | `Customer`, `Deal`, `DealItem` (Mapped from [crm plugin](../../plugins/crm/README.md))                                                                     |
| `atlas_hr`        | `Employee`, `Department`, `LeaveRequest`, `LeaveBalance`, `PayrollRecord` (Mapped from [hr plugin](../../plugins/hr/README.md))                            |
| `atlas_pm`        | `Project`, `Board`, `Issue`, `Comment`, `Step`, `Lineup`, `ErrorLog` (Mapped from [project-management plugin](../../plugins/project-management/README.md)) |

Every tenant-owned row carries an `organizationId`, and `User`/`Role` cascade-delete with their `Organization` — deleting an org cleans up its whole tenant. `Organization` itself carries `healthScore` and `mrr` fields, which is what backs the platform admin dashboard in `saas-portal`.

---

## Modules

### `auth`

Handles both **organization member auth** and **platform super-admin auth**.

| Endpoint                       | Purpose                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/register`          | Registers a **new organization + its first admin user** in one call — this is what `saas-portal`'s signup flow hits |
| `POST /auth/login`             | Org member login → session-backed access + refresh JWT                                                              |
| `POST /auth/super-admin/login` | Platform staff login → stateless JWT (`roles: ['SYSTEM_ADMIN']`), no DB session                                     |
| `POST /auth/refresh`           | Rotate access token from a refresh token                                                                            |
| `POST /auth/logout`            | Revoke the current session                                                                                          |
| `POST /auth/complete-setup`    | Marks a user's first-run setup as complete                                                                          |

Access tokens for regular users are validated against a live `Session` row (`JwtStrategy`), so revoking a session immediately invalidates its token — logout, and admin-forced logout, both work statelessly-on-read. Super-admin tokens skip the session table entirely and are trusted by JWT signature + `SYSTEM_ADMIN` role claim alone.

Route protection: `@Public()` opts a route out of the global `JwtAuthGuard` (applied app-wide via `APP_GUARD` in `app.module.ts`); `@Permissions('code.here')` + `PermissionsGuard` enforce RBAC on top of that.

### `users` / `roles`

Standard CRUD, always scoped to the authenticated user's `organizationId`. `roles` also exposes `GET /permissions` to list the full permission catalog available to build custom roles from — this is the "custom roles & permissions" feature sold on the Enterprise plan.

### `plugins`

The **Plugin Manager**. On boot, it scans `plugins/` at the repo root, reads each `manifest.json`, and upserts a `Plugin` row (`status: AVAILABLE | INSTALLED | ENABLED | DISABLED`). It resolves each plugin's compiled package (`@atlas/plugin-<id>`) or falls back to its `backend/src/index.ts` in dev.

| Endpoint                    | Purpose                           |
| --------------------------- | --------------------------------- |
| `GET /plugins`              | List plugins and their status     |
| `POST /plugins/:id/install` | Install a plugin for the org      |
| `POST /plugins/:id/enable`  | Enable an installed plugin        |
| `POST /plugins/:id/disable` | Disable it                        |
| `POST /plugins/:id/upgrade` | Upgrade to a newer plugin version |

### `admin`

Platform-level (cross-tenant) endpoints backing the `saas-portal` admin console — organization metrics/MRR, system logs, and support tickets. **Not** the same as an organization's own settings/admin area in `apps/frontend`.

### `audit`

Central audit log, queryable per organization, plus a lightweight support ticket API (`GET/POST /audit/tickets`).

### `health`, `common`

`GET /health` for uptime checks; `common/` holds the global `AllExceptionsFilter` and `TransformInterceptor` that give every response a consistent envelope/error shape.

---

## Running locally

```bash
# from the repo root
pnpm --filter backend db:generate    # generate the Prisma client
pnpm --filter backend db:migrate     # apply migrations (dev)
pnpm --filter backend db:seed        # seed sample data
pnpm --filter backend dev            # nest start --watch
```

- API: `http://localhost:3000/api/v1`
- Swagger docs: `http://localhost:3000/docs`

Other useful scripts: `db:studio` (Prisma Studio), `db:reset` (drop & re-migrate), `db:migrate:prod` (deploy migrations without prompting), `build` / `start:prod` for a production build.

### Environment

Copy `.env.example` from the repo root. Key variables:

| Variable                                                        | Purpose                                  |
| --------------------------------------------------------------- | ---------------------------------------- |
| `APP_PORT`                                                      | Port the API listens on (default `3000`) |
| `DATABASE_URL`                                                  | Postgres connection string               |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`                  | Redis, used for queues                   |
| `JWT_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION` | Token signing/expiry                     |
| `FRONTEND_URL`                                                  | Allowed CORS origin for `apps/frontend`  |

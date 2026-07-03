# `plugins/`

Business modules that organizations enable on top of the Atlas core platform, based on their subscription plan. Every plugin is self-contained — it ships its own backend module, frontend UI, and manifest — and plugs into the platform via the **Plugin Manager** (`apps/backend/src/plugins`) and the **frontend plugin host** (`apps/frontend/src/plugins`).

| Plugin | Included in | What it does |
|---|---|---|
| [`inventory`](#inventory) | Starter (opt-in) · Enterprise | Products, warehouses, stock levels & transactions |
| [`crm`](#crm) | Starter (opt-in) · Enterprise | Customers, deals pipeline, contact import/export |
| [`hr`](#hr) | Starter (opt-in) · Enterprise | Employees, leave, payroll |
| [`analytics`](#analytics) | Starter (opt-in) · Enterprise | Cross-plugin dashboards, anomaly detection, AI forecasting |

---

## How a plugin plugs in

Every plugin follows the same shape:

```
<plugin>/
├── manifest.json     # id, permissions, routes, widgets — read by the Plugin Manager
├── package.json      # @atlas/plugin-<id>, built with `tsc`
├── backend/
│   └── src/
│       ├── index.ts           # plugin entry — exported config / NestJS module
│       ├── <plugin>.module.ts # (where present) NestJS module wiring
│       ├── controllers/       # REST endpoints, mounted under /api/v1/<id>
│       └── services/          # business logic, Prisma access
└── frontend/
    └── src/
        ├── index.ts            # plugin entry, registered with the frontend plugin host
        ├── pages/               # top-level dashboard page for the plugin
        └── components/          # plugin-specific UI
```

1. On boot, the backend's **Plugin Manager** scans this directory, reads each `manifest.json`, and upserts a `Plugin` record.
2. Each plugin's NestJS module is loaded and its controllers are mounted under the core API (`/api/v1/<plugin-id>/...`).
3. When an org admin enables the plugin from the **Store** (`apps/frontend`), its frontend entry is mounted into the workspace and its routes/nav items (declared in `manifest.json`) become visible to that organization's users.
4. Plugins talk to each other only through `@atlas/events` (the shared event bus) — never by importing one another directly — so they stay independently deployable.
5. All shared framework code (`@atlas/ui`, `@atlas/plugin-sdk`, `@atlas/utils`, `@atlas/events`, …) comes from `packages/`.

---

## `inventory`

Product, warehouse, and stock management.

- **Data model:** `InventoryTable` (custom schema per org), `Product`, `Warehouse`, `Stock`, `StockTransaction`
- **API** (`/api/v1/inventory`): stats, dynamic table schema (`tables`, `tables/:id/schema`), products, warehouses, stock adjustments (`stock/adjust`), stock transactions, CSV import/export (`tables/:id/export`, `tables/:id/import`)
- **Frontend:** `InventoryDashboard`, with `ProductForm`, `WarehouseManager`, `AdjustmentLogs`
- **Permissions:** none declared yet in `manifest.json` (open item — see note below)

## `crm`

Customer relationship management — the module that reduced manual reconciliation work in earlier standalone versions of this idea, now generalized as a subscribable plugin.

- **Data model:** `Customer`, `Deal`, `DealItem`
- **API** (`/api/v1/crm`): plan-based `limits`, customers CRUD, deals pipeline CRUD, custom field `schema`, contact CSV import/export, `audit-logs`
- **Frontend:** `CrmDashboard`, with `CustomersList`, `DealsPipeline`, `CrmActivityLogs`
- **Permissions:** none declared yet in `manifest.json`

## `hr`

Employee and payroll management.

- **Data model:** `Employee`, `Department`, `LeaveRequest`, `LeaveBalance`, `PayrollRecord`
- **API** (`/api/v1/hr`): employees CRUD, `payroll` (list & run)
- **Frontend:** `HrDashboard`, with `EmployeesList`, `AddEmployeeModal`, `PayrollList`, `RunPayrollModal`
- **Shared:** `hr/shared/index.ts` — types shared between the plugin's own backend and frontend
- **Permissions:** `hr.read`, `hr.create`, `hr.update`, `hr.delete`, `hr.payroll.read`, `hr.payroll.write`

## `analytics`

The only plugin with its own backend microservice — a Python (FastAPI) engine alongside the standard NestJS module, since ML forecasting doesn't belong in the Node runtime.

- **NestJS layer** (`/api/v1/analytics`): `dashboard`, `anomalies`, `forecasts`, `reports/generate` — mostly proxies/aggregates for the Python engine
- **Python engine** (`python-engine/`, FastAPI, proxied in dev via `/api/analytics` → `http://127.0.0.1:8000`):
  - `main.py` — FastAPI app & routes
  - `etl.py` — pulls data out of the other plugins' schemas for processing
  - `ml.py` — `detect_anomalies`, `forecast_metric` (scikit-learn / statsmodels)
  - `database.py` — SQLAlchemy session against the shared Postgres instance
  - Scheduled jobs via `APScheduler`; PDF report generation via `reportlab`
- **Frontend:** `AnalyticsDashboard`
- **Permissions:** `analytics.read`, `analytics.reports`, `analytics.anomalies`, `analytics.forecasts`

**Running the analytics engine standalone:**
```bash
cd plugins/analytics/python-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Building a new plugin

1. Scaffold the standard shape above under `plugins/<name>`.
2. Define `manifest.json` against the `PluginManifest` type from `@atlas/plugin-sdk` — id, permissions, routes, nav items, widgets, events.
3. Build the backend module (NestJS) with controllers mounted at `/api/v1/<name>` and a Prisma schema scoped to its own Postgres schema (see `atlas_inventory` / `atlas_crm` / `atlas_hr` in `apps/backend/prisma/schema.prisma` for the pattern).
4. Build the frontend entry (`frontend/src/index.ts`) using `@atlas/ui` for components and `@atlas/events` for cross-plugin communication — never import another plugin's internals directly.
5. Add it to `pnpm-workspace.yaml` if not auto-detected; the Plugin Manager will pick it up automatically on the backend's next boot.
6. Update the plan definitions (`saas-portal/src/components/Pricing`) if the plugin should be gated to specific subscription tiers.

> **Note:** `inventory` and `crm` currently ship with empty `permissions: []` in their manifests, unlike `hr` and `analytics`. If you're adding RBAC checks to those plugins' endpoints, fill in their manifest permissions first — the `PermissionsGuard` in `apps/backend/src/auth` relies on them being declared.

# Atlas — Enterprise Application Platform (SaaS)

<p align="center">
  <strong>A modular, multi-tenant SaaS platform for enterprise software</strong><br/>
  Subscribe, spin up your own organization, and extend it with independently deployable plugins — all on a shared, event-driven core.
</p>

---

## ✨ What is Atlas?

Atlas is a **subscription-based SaaS platform**. Businesses sign up, create their own isolated organization (tenant), and pick the plugins they need — CRM, HR, Inventory, Analytics, and more — instead of buying and maintaining separate point solutions.

- 🏢 **Multi-tenant by design** — every organization gets isolated data and its own users, roles, and configuration.
- 💳 **Subscription-driven** — plans unlock which plugins and limits an organization gets access to, with a 14-day free trial on every tier.
- 🧩 **Plugin marketplace** — enable or disable business modules per organization without redeploying the platform.
- 🛠️ **Built for extension** — new plugins are built once against the Atlas Framework Layer and become available to every subscribed organization.

---

## 🏗️ Architecture

Atlas separates enterprise software into five layers, with subscription/tenant management sitting on top of the platform:

```
┌─────────────────────────────────────────────────────────────┐
│                SaaS Layer (Portal & Subscriptions)           │
│   Marketing Site  │  Signup & Onboarding  │  Platform Admin  │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│              Business Application Layer (Plugins)            │
│   Inventory  │  CRM  │  HR  │  Analytics  │  ...more         │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Atlas Framework Layer                     │
│  @atlas/ui  │  forms  │  grid  │  api  │  events  │  sdk     │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                     Core Platform Layer                      │
│  Auth  │  Organizations  │  Users  │  Plugins  │  Audit      │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Infrastructure Layer                      │
│  PostgreSQL  │  Redis  │  Docker  │  BullMQ  │  Nginx        │
└─────────────────────────────────────────────────────────────┘
```

**How it fits together:**
1. A prospective customer subscribes through the **SaaS portal**, choosing a plan.
2. This provisions a new **Organization** (tenant) with its own isolated data.
3. The org's admin enables the **plugins** included in their plan from the plugin manager.
4. Every plugin is built on the shared **Atlas Framework Layer**, so it looks, feels, and behaves consistently.
5. The **Core Platform Layer** enforces auth, roles/permissions, and auditing across every tenant.

---

## 📦 Monorepo Structure

```
atlas/
├── apps/
│   ├── saas-portal/       # Marketing site, pricing, signup & platform admin console
│   ├── frontend/          # Core product app used by subscribed organizations
│   ├── backend/           # NestJS API — auth, organizations, users, roles, plugins, audit
│   └── worker/            # BullMQ background worker
│
├── packages/
│   ├── atlas-ui/          # Enterprise UI Component Library
│   ├── atlas-forms/       # Form Framework
│   ├── atlas-grid/        # Enterprise Data Grid
│   ├── atlas-api/         # HTTP Client & Request Framework
│   ├── atlas-events/      # Event System
│   ├── atlas-logger/      # Logging Framework
│   ├── atlas-storage/     # Storage Abstraction Layer
│   ├── atlas-dashboard/   # Dashboard Engine
│   ├── atlas-widgets/     # Widget Framework
│   ├── atlas-plugin-sdk/  # Plugin Development SDK
│   ├── atlas-config/      # Configuration Framework
│   ├── atlas-auth/        # Authentication Utilities
│   └── atlas-utils/       # Shared Utilities
│
├── plugins/
│   ├── inventory/         # Inventory Management Plugin
│   ├── crm/               # Customer Relationship Management Plugin
│   ├── hr/                # HR & Payroll Management Plugin
│   └── analytics/         # Real-time Analytics & Forecasting Plugin
│
├── infrastructure/
│   ├── docker/            # Dockerfiles
│   ├── nginx/             # Nginx configuration
│   └── scripts/           # Operational scripts
│
├── docs/                  # Architecture documentation
└── tests/                 # Integration & E2E tests
```

---

## 💳 Plans & Plugins

| Plan | Price | Plugins & Limits |
|---|---|---|
| **Starter** | $49/mo | Core platform, limited seats, pick your plugins |
| **Enterprise** | $199/mo | Unlimited users, all plugins (CRM, HR, Inventory, Analytics), priority 24/7 support, custom roles & permissions, SSO |
| **Custom** | Contact us | Tailored limits, plugins, and support for large organizations |


---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| SaaS Portal | React, TypeScript, Vite |
| Frontend | React, TypeScript, Vite, React Router |
| Backend | NestJS, TypeScript, Prisma (multi-schema, multi-tenant) |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | BullMQ |
| Containers | Docker, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

### Setup

```bash
# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL, Redis)
docker compose up -d

# Run database migrations
pnpm --filter backend db:migrate

# Seed database
pnpm --filter backend db:seed

# Start development servers (saas-portal, frontend, backend)
pnpm dev
```

By default:
- **SaaS portal** (marketing, pricing, signup, platform admin) → `http://localhost:5174`
- **Product frontend** (used by subscribed organizations) → `http://localhost:5173`
- **Backend API** → `http://localhost:3000`

---

## 🧩 Building a Plugin

New business modules are built against `@atlas/atlas-plugin-sdk` and dropped into `plugins/`. Each plugin ships a `manifest.json` declaring its id, permissions, routes, and widgets — the backend's Plugin Manager auto-discovers it, registers it, and makes it available for organizations to enable based on their subscription.

---

## 📄 License

MIT

---

**Atlas** — *Build enterprise platforms, not enterprise applications.*

# Atlas Enterprise Application Framework (AEAF)

<p align="center">
  <strong>A modular, event-driven Enterprise Application Framework</strong><br/>
  Build scalable enterprise software through independently deployable plugins on a shared platform.
</p>

---

## 🏗️ Architecture

Atlas separates enterprise software into four distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│              Business Application Layer (Plugins)           │
│  Inventory  │  CRM  │  HR  │  Reporting  │  Manufacturing  │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Atlas Framework Layer                     │
│  @atlas/ui  │  forms  │  grid  │  api  │  events  │  sdk   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                     Core Platform Layer                      │
│  Auth  │  Users  │  Plugins  │  Events  │  Config  │  Audit │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Infrastructure Layer                       │
│  PostgreSQL  │  Redis  │  Docker  │  BullMQ  │  Nginx       │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Monorepo Structure

```
atlas/
├── apps/
│   ├── frontend/          # React + Vite + TypeScript
│   ├── backend/           # NestJS + TypeScript
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
│   └── crm/               # Customer Relationship Management Plugin
│
├── infrastructure/
│   ├── docker/            # Dockerfiles
│   ├── nginx/             # Nginx configuration
│   └── scripts/           # Operational scripts
│
├── docs/                  # Architecture documentation
└── tests/                 # Integration & E2E tests
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, React Router |
| Backend | NestJS, TypeScript, Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | BullMQ |
| Containers | Docker, Docker Compose |

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

# Start development servers
pnpm dev
```

## 📄 License

MIT

---

**Atlas** — *Build enterprise platforms, not enterprise applications.*

# `apps/worker`

The Atlas platform background worker — a Node service that runs in isolation to consume asynchronous jobs via **BullMQ** (powered by Redis). This offloads heavy processing from the backend API's request-response cycle.

- **Stack:** Node.js + TypeScript
- **Queue Engine:** BullMQ (Redis)
- **Role:** Handles asynchronous jobs, scheduled tasks, notifications, and cross-tenant batch updates.

---

## Architecture & Queue Flows

```
┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
│   backend-api   ├────────────►│   Redis Queue   ├────────────►│  worker-service  │
│   (NestJS API)  │  Push Job   │    (BullMQ)     │  Consume    │  (BullMQ Job)   │
└─────────────────┘             └─────────────────┘             └─────────────────┘
```

1. **Queue Creation:** The main NestJS backend API (`apps/backend`) pushes jobs (such as `auth.login` audits or `notification` alerts) into Redis queues using the custom `QueuesService`.
2. **Job Lifecycle:** BullMQ schedules, buffers, and persists jobs inside Redis under respective queue keys.
3. **Execution:** The worker app registers active consumers that pull tasks off Redis, executes the database and mock email actions using Prisma, and records failures or outputs.

---

## Structure

```
worker/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts        # Bootstrap entry point (instantiates and runs Workers)
    └── jobs/           # Individual job processors
        ├── audit-log.processor.ts    # Persists AuditLog and SystemLog entries
        └── notification.processor.ts # Persists notifications and simulates email dispatch
```

---

## Running locally

```bash
# Ensure Redis and Postgres container dependencies are up
docker compose up -d redis postgres

# Run worker in development mode (using nodemon and ts-node)
pnpm --filter @atlas/worker dev
```

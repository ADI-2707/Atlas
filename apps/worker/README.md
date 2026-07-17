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

1. **Queue Creation:** The main NestJS backend API creates a queue handler (e.g. `mail-delivery-queue`, `analytics-etl-queue`) and pushes jobs into it.
2. **Job Lifecycle:** BullMQ schedules, buffers, and persists jobs inside Redis under tenant-isolated IDs.
3. **Execution:** The worker app registers workers that listen to specific queues, pops tasks off the queue, executes the job logic within the tenant context, and registers completion or failure logs in the Postgres `SystemLog` table.

---

## Structure

```
worker/
├── package.json
└── src/ (Planned implementation directory)
    ├── index.ts        # Worker entry point
    ├── queue/          # Queue registration & listeners
    └── jobs/           # Individual job processors (e.g., report-generation, emails)
```

---

## Running locally

```bash
# Start Redis dependencies via Docker first
docker compose up -d redis

# Run worker in development mode
pnpm --filter worker dev
```

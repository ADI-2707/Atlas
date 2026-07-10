FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm and openssl
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages ./packages/
COPY plugins ./plugins/

# Install dependencies
COPY . .
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter @atlas/backend db:generate
RUN pnpm exec prisma generate --schema=plugins/inventory/backend/prisma/schema.prisma

# Build the backend
RUN pnpm --filter @atlas/backend... build

# Deploy isolated backend (extracts only @atlas/backend and its production dependencies)
RUN pnpm deploy --filter @atlas/backend --prod /prod/backend

FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm and openssl
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy the isolated production build
COPY --from=builder /prod/backend .
# Note: pnpm deploy doesn't generate the prisma client natively, so we regenerate it
COPY --from=builder /app/apps/backend/prisma ./prisma
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=1
RUN npx prisma@5.22.0 generate

# Copy plugin manifests so PluginManagerService can discover them
COPY --from=builder /app/plugins ./plugins

# Generate Prisma client for inventory plugin
RUN npx prisma@5.22.0 generate --schema=./plugins/inventory/backend/prisma/schema.prisma

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV APP_PORT=3000

CMD ["node", "dist/main.js"]

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

# Install dependencies (only what's needed to build backend and its deps)
# We copy the whole source for simplicity, but only build the backend
COPY . .
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter @atlas/backend db:generate

# Build the backend and its package dependencies
RUN pnpm --filter @atlas/backend... build

FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm and openssl
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages ./packages/
COPY --from=builder /app/plugins ./plugins/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
# Re-generate in prod environment to ensure correct engine
RUN npx prisma@5.22.0 generate --schema=apps/backend/prisma/schema.prisma

# Copy built dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV APP_PORT=3000

CMD ["node", "apps/backend/dist/main.js"]

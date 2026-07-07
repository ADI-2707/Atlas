FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/saas-portal/package.json ./apps/saas-portal/

COPY . .
RUN pnpm install --frozen-lockfile

# Expose build args
ARG VITE_API_URL
ARG VITE_APP_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL

RUN pnpm --filter saas-portal build

FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/apps/saas-portal/dist /usr/share/nginx/html

# Copy custom nginx config for SPA
COPY infrastructure/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

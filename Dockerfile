# syntax=docker/dockerfile:1

FROM node:24.14.1-alpine AS base

WORKDIR /app
RUN npm install -g pnpm@9.15.3

FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src ./src
RUN pnpm build

FROM base AS prod-deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile --prod

FROM node:24.14.1-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package.json ./

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]

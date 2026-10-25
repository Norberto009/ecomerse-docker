# Etapa 1 - base
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app


# Etapa 2 - deps: Solo dependencias (capa cacheable)
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund


# Etapa 3 - builder: next build -> .next/standalone
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# Etapa 4 -runner: imagen final  
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nosejs \
    && adduser -S -u 1001 -G nodejs nextjs
    
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interal=30s --timeout=5s --start-period=20s retries=3 \
    CMD wget -q0- http://127.0.0.1:3000/login > /dev/null || exit 1

CMD ["node", "server.js"]    
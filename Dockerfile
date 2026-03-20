# ── Stage 1: Build Vite frontend ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build the Vite frontend → outputs to dist/
RUN npm run build


# ── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy server + seed (schema only)
COPY server.ts ./
COPY seed.ts ./
COPY tsconfig.json ./

# tsx runs TypeScript directly
RUN npm install -g tsx

# Create persistent directories
RUN mkdir -p /app/data /app/uploads/covers /app/uploads/pdfs

ENV NODE_ENV=production
ENV PORT=5174

EXPOSE 5174

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5174/health || exit 1

# Run schema migration then start server
CMD sh -c "tsx seed.ts && tsx server.ts"

# ENN — Entrepreneur News Network

Monthly magazine platform for founders, by founders.

## Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express + better-sqlite3
- **Auth**: JWT (httpOnly cookie)
- **Deployment**: Docker + Nginx

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

## Production (Docker)

```bash
cp .env.example .env
# Set a strong JWT_SECRET in .env
docker compose up -d --build
```

## First Admin

Register via the site, then promote to admin in the DB:

```bash
docker exec -it enn-magazine sh
apk add --no-cache sqlite
sqlite3 /app/data/enn.db
UPDATE users SET role='admin' WHERE email='your@email.com';
.quit
```

## Update Deployment

```bash
git pull origin master
docker compose up -d --build
```

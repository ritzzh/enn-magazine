# ENN Magazine — Entrepreneur News Network

Full-stack magazine platform. Vite (React) frontend + Express backend, single server, single Docker container.

## How it works

```
Dev:   tsx server.ts → Express on :4000
       Vite dev server on :5173, proxies /api + /uploads → :4000

Prod:  vite build → dist/
       tsx server.ts → Express on :3000, serves dist/ as static files
       Everything on one port. No separate processes.
```

## Project structure

```
enn-magazine/
├── server.ts          ← Express API + SQLite + serves dist/ in prod
├── seed.ts            ← DB seed (idempotent, runs at Docker startup)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── MagazineDetailPage.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── TopBar.tsx
│   │   ├── Footer.tsx
│   │   ├── FeaturedSpotlight.tsx
│   │   ├── MagazineGrid.tsx
│   │   ├── AuthModal.tsx
│   │   ├── DownloadModal.tsx
│   │   └── AdminPanel.tsx
│   ├── context/AuthContext.tsx
│   ├── lib/api.ts
│   └── styles/globals.css
├── uploads/           ← Cover images + PDFs (Docker volume)
├── data/              ← SQLite database (Docker volume)
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

---

## 🚀 Deploy (Docker — 3 commands)

```bash
git clone <your-repo> enn-magazine
cd enn-magazine

cp .env.example .env
# Edit .env — set JWT_SECRET to a long random string

docker compose up -d --build
```

App runs at `http://YOUR_SERVER_IP:3000`

### Make yourself admin

```bash
docker exec -it enn-magazine sh
sqlite3 /app/data/enn.db "UPDATE users SET role='admin' WHERE email='your@email.com';"
exit
```

Refresh the page — the ⚙ Admin button appears in the navbar.

---

## 💻 Local dev

```bash
npm install
npm run dev     # tsx server.ts → :4000, Vite proxies to it
```

Open `http://localhost:5173`


---

## 🪟 Windows local dev

`better-sqlite3` compiles native C++ bindings. v11 ships prebuilt binaries for Windows x64 + Node 20/22, so `npm install` should work without Visual Studio.

**If `npm install` still fails:**

Option A — Install Windows build tools (one-time, ~5 min, needs admin):
```
npm install --global windows-build-tools
npm install
```

Option B — Use the helper script:
```
setup-windows.cmd
```

Option C — Use Docker for local dev too (avoids the issue entirely):
```
docker compose up --build
```
Then open `http://localhost:3000` — Docker handles all native builds inside Alpine Linux.

---

## 🔄 Update after code changes

```bash
git pull
docker compose up -d --build
```

Volumes survive rebuilds — DB and uploads are safe.

---

## 🐳 Docker commands

```bash
docker compose logs -f        # Live logs
docker compose restart        # Restart without rebuild
docker compose down           # Stop
docker compose down -v        # Stop + wipe data (destructive!)
```

---

## 🌱 Default seed data

First startup auto-seeds:
- **Admin account**: `admin@enn.com` / `admin123` — promote your own account then disregard this one
- **6 sample magazines** (Oct 2025 → Mar 2026) with realistic content
- **3 sample comments** on the featured issue

---

## 🔒 Admin panel tabs

| Tab | What you can do |
|-----|----------------|
| Dashboard | Stats: users, downloads, likes, comments; top magazines; recent activity |
| Publish | Upload PDF + cover image, set title/headline/description/month/year/category, mark featured |
| Magazines | Edit or delete any magazine |
| Users | View all accounts, promote/demote admin |
| Downloads | Full log: name, email, phone, date, guest vs member |

---

## 📖 API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login (sets httpOnly cookie) |
| POST | `/api/auth/logout` | — | Logout |
| GET | `/api/auth/me` | cookie | Current user |
| GET | `/api/magazines` | optional | List published magazines |
| GET | `/api/magazines/:id` | optional | Magazine + comments |
| POST | `/api/magazines/:id/download` | optional | Download (guest needs name+email) |
| POST | `/api/magazines/:id/like` | cookie | Toggle like |
| POST | `/api/magazines/:id/comments` | optional | Post comment (anonymous OK) |
| POST | `/api/comments/:id/upvote` | optional | Upvote comment |
| GET | `/api/admin/dashboard` | admin | Stats |
| GET/POST | `/api/admin/magazines` | admin | List / create |
| PUT/DELETE | `/api/admin/magazines/:id` | admin | Edit / delete |
| GET | `/api/admin/users` | admin | All users |
| PATCH | `/api/admin/users/:id/role` | admin | Change role |
| GET | `/api/admin/downloads` | admin | Download log |
| GET | `/health` | — | Health check |

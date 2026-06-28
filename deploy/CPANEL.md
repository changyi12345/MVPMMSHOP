# rankage.shop — cPanel Hosting Guide (Shared Hosting)

Hosting plan: cPanel + Node.js + LiteSpeed + Free SSL + 10 subdomains.

| Service | URL | cPanel app |
|---------|-----|------------|
| Web + Admin | https://rankage.shop | Node.js App #1 |
| API | https://api.rankage.shop | Node.js App #2 |
| Database | Neon PostgreSQL (cloud) | cPanel MySQL **မသုံး** |

---

## အကျဉ်းချုပ် (3 ခြေလှမ်း)

1. cPanel မှာ **subdomain** `api.rankage.shop` ဖန်တီးပါ
2. **Node.js App** ၂ ခု setup — frontend + backend
3. **AutoSSL** ဖွင့်ပြီး Google OAuth origin ထည့်ပါ

---

## 1. Domain & DNS

Domain က hosting package နဲ့ `.shop` free ရပြီးသားဆိုရင် cPanel → **Domains** မှာ `rankage.shop` primary domain ဖြစ်နေပါမယ်။

**Subdomain ဖန်တီးပါ** (cPanel → Domains → Subdomains):

| Subdomain | Document root (ဥပမာ) |
|-----------|---------------------|
| `api` | `/home/USER/api.rankage.shop` |

`www.rankage.shop` → cPanel Redirects မှာ apex domain သို့ redirect (optional).

**SSL:** cPanel → **SSL/TLS Status** → `rankage.shop` + `api.rankage.shop` → **Run AutoSSL**.

---

## 2. Code upload (Git သို့မဟုတ် File Manager)

### Option A — Git (recommended)

cPanel → **Git Version Control** → Clone repository:

```
/home/USER/mvpmms
```

`.cpanel.yml` (repo root) က deploy hook run ပါမယ် — ပထမဆုံး manual setup လုပ်ပြီးမှ Git deploy သုံးပါ。

### Option B — ZIP upload

Local မှာ project zip လုပ်ပြီး File Manager ဖြင့် `/home/USER/mvpmms` သို့ upload + extract.

**`.env` files ကို server ပေါ်မှာ manually ထည့်ပါ** (Git commit မလုပ်ပါနဲ့):

- `/home/USER/mvpmms/backend/.env`
- `/home/USER/mvpmms/frontend/.env.production`

---

## 3. Backend — `api.rankage.shop`

cPanel → **Setup Node.js App** (or **Node.js Selector**):

| Setting | Value |
|---------|-------|
| Node.js version | **18.x** or **20.x** (အမြင့်ဆုံး) |
| Application mode | Production |
| Application root | `/home/USER/mvpmms/backend` |
| Application URL | `api.rankage.shop` |
| Application startup file | `server.js` |
| Passenger log file | (default OK) |

**Environment variables** (cPanel Node.js app → Add Variable):

```env
NODE_ENV=production
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
JWT_SECRET=<your-secret>
APP_BASE_URL=https://rankage.shop
CORS_ORIGINS=https://rankage.shop,https://www.rankage.shop
GOOGLE_CLIENT_ID=1043403458086-....apps.googleusercontent.com
G2BULK_API_KEY=...
```

> cPanel က `PORT` ကို auto-set လုပ်ပါမယ် — `backend/server.js` က `$PORT` သုံးပါမယ်。

**Terminal (cPanel → Terminal / SSH):**

```bash
source /home/USER/nodevenv/mvpmms/backend/18/bin/activate   # path varies — copy from Node.js app page
cd ~/mvpmms/backend
npm ci
npx prisma generate
npx prisma db push
npm run db:seed    # first time only — admin / admin123
npm run build
npm prune --omit=dev    # save disk space after build
```

cPanel Node.js app page → **Restart** နှိပ်ပါ。

**Test:** `https://api.rankage.shop/settings/shop` → JSON ပြန်ရမယ်。

---

## 4. Frontend — `rankage.shop`

**Setup Node.js App #2:**

| Setting | Value |
|---------|-------|
| Node.js version | **18.x** or **20.x** |
| Application mode | Production |
| Application root | `/home/USER/mvpmms/frontend` |
| Application URL | `rankage.shop` |
| Application startup file | `server.js` |

**Environment variables:**

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.rankage.shop
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1043403458086-....apps.googleusercontent.com
```

**Deploy (recommended):** PC မှာ `deploy/prepare-prod-zips.ps1` run → `deploy-web.zip` upload/extract (`.next` included).

**Terminal (server — install only, NO build):**

```bash
source /home/USER/nodevenv/public_html/rankage.shop/20/bin/activate
cd ~/public_html/rankage.shop
npm install --omit=dev
```

> **`npm run build` server မှာ မလုပ်ပါနဲ့** — zip ထဲ `app/` မပါ။ Build error: *Couldn't find any pages or app directory*.

cPanel → **Restart** Node.js app → **Test:** `https://rankage.shop`

---

## 5. Uploads folder (payment proofs, banners)

Backend uploads path:

```bash
mkdir -p ~/mvpmms/backend/uploads
chmod 755 ~/mvpmms/backend/uploads
```

NestJS က `/uploads/` serve လုပ်ပါမယ် — `https://api.rankage.shop/uploads/...`

---

## 6. Google OAuth

Google Cloud Console → Web client → **Authorized JavaScript origins:**

- `https://rankage.shop`
- `https://www.rankage.shop`

---

## 7. Storage & limits (10GB plan)

| Tip | Detail |
|-----|--------|
| `--omit=dev` | build ပြီးရင် `npm prune --omit=dev` — devDeps ဖယ်ပါ |
| Playwright | frontend production install မှာ browser download **မလုပ်ပါ** (postinstall skip) |
| `node_modules` | app တစ်ခုချင်း ~200–400MB — 2 apps ≈ 1GB |
| Neon DB | cPanel MySQL 1GB **မသုံး** — cloud DB သုံးပါ |
| Backups | cPanel Daily Backup (3 gens) + Neon backup |

---

## 8. Update / redeploy

```bash
cd ~/mvpmms
git pull

cd backend
npm ci --omit=dev
npx prisma db push
npm run build
# Restart backend Node.js app in cPanel

cd ../frontend
npm ci --omit=dev
npm run build
# Restart frontend Node.js app in cPanel
```

---

## 9. Troubleshooting

| Problem | Fix |
|---------|-----|
| 503 Service Unavailable | Node.js app Restart; startup file = `server.js`; build completed? |
| FileNotFoundError `.htaccess` | `touch public_html/rankage.shop/.htaccess` (+ API folder); then Restart |
| CORS error | Backend env `CORS_ORIGINS` မှာ `https://rankage.shop` ပါမပါ |
| API 404 on frontend | `NEXT_PUBLIC_API_URL=https://api.rankage.shop` + frontend rebuild |
| Prisma error | `npx prisma generate && npx prisma db push` |
| SSL mixed content | Both domains AutoSSL active; URLs must be `https://` |
| Out of memory on build | cPanel Terminal မှာ `export NODE_OPTIONS=--max-old-space-size=512` |

---

## 10. Post-deploy checklist

- [ ] https://rankage.shop — home page
- [ ] https://api.rankage.shop/settings/shop — JSON
- [ ] https://rankage.shop/admin/login — admin panel
- [ ] Register / login / Google sign-in
- [ ] Admin password ပြောင်း (default: admin / admin123)
- [ ] Payment proof upload test

---

## Files in this repo

| File | Purpose |
|------|---------|
| `backend/server.js` | cPanel startup entry |
| `frontend/server.js` | cPanel startup entry |
| `deploy/cpanel-install-backend.sh` | SSH install script |
| `deploy/cpanel-install-frontend.sh` | SSH install script |
| `.cpanel.yml` | Git deploy hook (optional) |

VPS guide: `deploy/RANKAGE.md` (optional, if you upgrade later)

# rankage.shop — cPanel Deploy (အစ부터 တစ်ဆင့်ချင်း)

**Hosting:** zwhhosting cPanel  
**Web:** https://rankage.shop  
**API:** https://api.rankage.shop  
**DB:** Neon PostgreSQL (cloud)

---

## Phase 0 — ရှင်းလင်းပါ (One time)

cPanel မှာ:

1. **Setup Node.js App** → app အားလုံး **Destroy** (env values copy ထားပါ)
2. File Manager:
   - `/home/USER/api.rankage.shop/` — files အားလုံး delete (folder ထားပါ)
   - `/home/USER/public_html/rankage.shop/` — files delete (folder ထားပါ)
3. **`node_modules` real folder** upload မလုပ်ပါ — cPanel symlink သာ

---

## Phase 1 — Domain setup

### 1.1 Domains (cPanel → Domains)

| Domain | Document Root |
|--------|---------------|
| `rankage.shop` | `public_html/rankage.shop` |
| `api.rankage.shop` | **`api.rankage.shop`** ← `/public_html` **NOT** |

### 1.2 DNS (Zone Editor → rankage.shop)

| Type | Name | Value |
|------|------|-------|
| A | `@` | Server IP |
| A | `api` | Server IP |
| A | `www` | Server IP |

Server IP: cPanel → **Server Information** → Shared IP

### 1.3 SSL

**SSL/TLS Status** → AutoSSL run for `rankage.shop` + `api.rankage.shop`

Verify (PC CMD):
```
nslookup api.rankage.shop
nslookup rankage.shop
```

---

## Phase 2 — Backend (API)

### 2.1 Upload

PC file: **`MVPMMSHOP/deploy-api.zip`**

File Manager → `/home/USER/api.rankage.shop/` → Upload → Extract

Structure:
```
api.rankage.shop/
├── package.json
├── server.js
├── src/
├── prisma/
└── .env
```

### 2.2 `.htaccess`

Folder ထဲ `.htaccess` empty file create (မရှိရင်)

### 2.3 Node.js App #1 (Create)

| Field | Value |
|-------|-------|
| Node.js | 20.x |
| Mode | Production |
| Root | `api.rankage.shop` |
| URL | `api.rankage.shop` |
| Startup | `server.js` |

**Environment variables** (Add Variable):

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-weathered-glitter-aog4klck-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=change-to-long-random-string-min-32-chars
APP_BASE_URL=https://rankage.shop
CORS_ORIGINS=https://rankage.shop,https://www.rankage.shop
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
G2BULK_API_KEY=your-g2bulk-api-key
```

### 2.4 `server.js` check

```js
require('./dist/src/main');
```

### 2.5 Terminal install (cPanel page → venv command copy)

```bash
source /home/USER/nodevenv/api.rankage.shop/20/bin/activate
cd /home/USER/api.rankage.shop
npm install --include=dev --ignore-scripts
./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma
export NODE_OPTIONS=--max-old-space-size=512
./node_modules/.bin/nest build
mkdir -p uploads
ls dist/src/main.js
```

**DB push/seed — server မှာ run မလုပ်ပါ** (hosting block ဖြစ်နိုင်ပါတယ်)

**Local PC (PowerShell):**
```powershell
cd C:\Users\champ\OneDrive\Desktop\MVPMMSHOP\backend
npx prisma db push --accept-data-loss
npm run db:seed
```

### 2.6 Restart + test

Node.js → **Restart**

```
https://api.rankage.shop/settings/shop
```

---

## Phase 3 — Frontend (Web)

### 3.1 Upload

PC file: **`MVPMMSHOP/deploy-web.zip`**

File Manager → `/home/USER/public_html/rankage.shop/` → Upload → Extract

### 3.2 `.env.production` (folder ထဲ)

```
NEXT_PUBLIC_API_URL=https://api.rankage.shop
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1043403458086-fa28d81odsntn6touqttjlqhltdo8tvp.apps.googleusercontent.com
```

### 3.3 Node.js App #2 (Create)

| Field | Value |
|-------|-------|
| Root | `public_html/rankage.shop` |
| URL | `rankage.shop` |
| Startup | `server.js` |

### 3.4 Terminal (**`npm run build` server မှာ မလုပ်ပါ**)

```bash
source /home/USER/nodevenv/public_html/rankage.shop/20/bin/activate
cd /home/USER/public_html/rankage.shop
npm install --omit=dev
ls -la .next/BUILD_ID server.js
bash ~/mvpmms/deploy/check-web-cpanel.sh   # optional diagnostic
```

### 3.5 Restart + test

```
https://rankage.shop
https://rankage.shop/admin/login
```

---

## Phase 4 — Google OAuth

Google Cloud Console → Web client → Authorized origins:

- `https://rankage.shop`
- `https://www.rankage.shop`

---

## Phase 5 — Troubleshooting

| Problem | Fix |
|---------|-----|
| DNS_PROBE NXDOMAIN | Zone Editor A record `api` add |
| package.json not found | ZIP extract to correct folder root |
| nest not found | `npm install --include=dev --ignore-scripts` |
| dist/main.js not found | Use `dist/src/main.js` |
| P1001 Neon DB | Hosting blocks 5432 → support ticket or Railway API |
| node_modules conflict | Delete real folder, keep symlink only |
| Prisma SIGABRT / uv_thread_create | `PRISMA_SKIP_POSTINSTALL_GENERATE=1 npm install --omit=dev` then upload `prisma-cpanel.zip` to venv `lib/node_modules/` |

### Neon DB blocked ဖြစ်ရင် (Plan B)

API → **Railway.app** (free) host  
Frontend → cPanel `rankage.shop`  
`NEXT_PUBLIC_API_URL` → Railway URL

---

## Admin login

```
https://rankage.shop/admin/login
User: admin
Pass: admin123  ← ပြောင်းပါ
```

---

## Deploy ZIP files (PC)

| File | Upload to |
|------|-----------|
| `deploy-api.zip` | `api.rankage.shop/` |
| `deploy-web.zip` | `public_html/rankage.shop/` |

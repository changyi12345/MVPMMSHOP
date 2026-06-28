# 503 — အပြည့်အစုံ ပြန် Deploy (Terminal မလို)

**503 = Node app မအလုပ်လုပ်** (SMTP/password issue မဟုတ် — app files / .htaccess / process limit)

PC မှာ zip အသစ် ပြင်ဆင်ပြီး:
- `deploy/output/deploy-api.zip` (~2 MB)
- `deploy/output/deploy-web.zip` (~13 MB)

---

## Phase 0 — Apps ရပ်ပါ (20 မိနစ်)

cPanel → **Setup Node.js App** → **Stop**:
1. `api.rankage.shop`
2. `rankage.shop`

**20 မိနစ်** စောင့်ပါ (fork error / process limit clear)

Terminal **မသုံးပါ**

---

## Phase 1 — API ပြန် Upload

### 1.1 File Manager

1. Folder: **`api.rankage.shop`**
2. Files အားလုံး select → **Delete** (folder本身 ထားပါ)
3. PC က **`deploy-api.zip`** upload
4. Extract → zip file delete

ရှိရမယ်: `server.js`, `dist/src/main.js`, `package.json`, `.htaccess`

### 1.2 `.htaccess` စစ် (Edit)

Passenger block **ပါ/empty မဖြစ်ရ** — zip ထဲ `.htaccess` ပါပြီး

### 1.3 Node.js App — API settings

| Field | Value |
|-------|-------|
| Root | `api.rankage.shop` |
| URL | `api.rankage.shop` |
| Startup | `server.js` |
| Mode | Production |

**Environment variables** (copy from cPanel — **PORT မထည့်ပါ**):

- `NODE_ENV=production`
- `DATABASE_URL=...`
- `DIRECT_URL=...`
- `JWT_SECRET=...`
- `CORS_ORIGINS=https://rankage.shop,https://www.rankage.shop`
- `APP_BASE_URL=https://rankage.shop`
- `GOOGLE_CLIENT_ID=...`
- `G2BULK_API_KEY=...`
- `SMTP_*` (FROM = `MVPMMSHOP <noreply@rankage.shop>`)
- `VAPID_*`

### 1.4 Run NPM Install

Node.js App page → **Run NPM Install** (Terminal မလို)

### 1.5 Start API

**Start** → browser: `https://api.rankage.shop/health`

**Must be:** `{"ok":true,...}`

**503 ဆက်ရှိ** → cPanel → app → **stderr log** screenshot ပို့ပါ

---

## Phase 2 — Web ပြန် Upload

### 2.1 File Manager

1. Folder: **`public_html/rankage.shop`**
2. Files delete (folder ထား)
3. Upload **`deploy-web.zip`** → Extract

ရှိရမယ်: `server.js`, `.next/BUILD_ID`, `public/`, `.htaccess`

### 2.2 Node.js App — Web settings

| Field | Value |
|-------|-------|
| Root | `public_html/rankage.shop` |
| URL | `rankage.shop` |
| Startup | `server.js` |

Env (minimal):
- `NODE_ENV=production`
- **PORT မထည့်ပါ**

(API URL `.env.production` + `.htaccess` SetEnv ထဲ baked in)

### 2.3 Run NPM Install → Start

Test:
- `https://rankage.shop`
- `https://rankage.shop/admin/login`

---

## Phase 3 — Domains စစ်

cPanel → **Domains**:

| Domain | Document Root |
|--------|---------------|
| `rankage.shop` | `public_html/rankage.shop` |
| `api.rankage.shop` | `api.rankage.shop` |

---

## Still 503?

**Hosting support** (zwhhosting) ticket:

> Account `ztkopszw`: Node.js apps return 503. `fork: Resource temporarily unavailable`. Please kill stale node/lsnode processes and check LVE/NPROC limits. Apps: api.rankage.shop + rankage.shop, Passenger + server.js.

---

## PC verify (after server fix)

```powershell
powershell -ExecutionPolicy Bypass -File deploy\verify-prod.ps1
```

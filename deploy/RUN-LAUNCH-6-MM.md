# Launch 6 Steps — RUN NOW (L1–L6 + M2 + Push)

**Current prod status (check):** `powershell -File deploy/verify-prod.ps1`  
If API/Web return **404** → Node.js apps are down or files not uploaded. Follow **Step 1** first.

---

## Step 1 — Prod deploy + restart API (L1)

### A. Local (your PC)

```powershell
cd C:\Users\champ\OneDrive\Desktop\MVPMMSHOP
powershell -ExecutionPolicy Bypass -File deploy\prepare-prod-zips.ps1
```

Output:
- `deploy/output/deploy-api.zip` → upload to **api.rankage.shop** folder
- `deploy/output/deploy-web.zip` → upload to **public_html/rankage.shop**

Also run DB schema (if not done):

```powershell
cd backend
npx prisma db push
```

### B. cPanel — Backend (`api.rankage.shop`)

1. File Manager → `api.rankage.shop/` → delete old files (keep `.env` backup)
2. Upload + extract `deploy-api.zip`
3. Ensure `.env` exists (copy from `deploy/backend.env.cpanel` + fill secrets)
4. **Setup Node.js App** → Restart startup file `server.js`
5. Terminal (cPanel venv):

```bash
cd ~/api.rankage.shop
npm install --omit=dev
npx prisma generate
mkdir -p uploads
```

6. **Restart** Node app

**Verify:** `https://api.rankage.shop/health` → `{"ok":true,...}`

### C. cPanel — Frontend (`rankage.shop`)

1. Upload + extract `deploy-web.zip` to `public_html/rankage.shop`
2. `.env.production` must include:

```env
NEXT_PUBLIC_API_URL=https://api.rankage.shop
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1043403458086-fa28d81odsntn6touqttjlqhltdo8tvp.apps.googleusercontent.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<paste public key from Step 6>
```

3. Terminal:

```bash
cd ~/public_html/rankage.shop
npm install --omit=dev
```

4. **Restart** Node app

**Verify:** `https://rankage.shop` and `https://rankage.shop/admin/login`

Full detail: `deploy/STEP-BY-STEP-MM.md`

---

## Step 2 — Admin Settings (L5)

Login: `https://rankage.shop/admin/login` (admin / **change password in Step 4**)

**Admin → Settings → General**
| Field | Example |
|-------|---------|
| Shop name | MVPMMSHOP |
| Tagline | Fast & Trusted — Instant Delivery |
| Contact email | support@yourdomain.com |
| Contact phone | 09xxxxxxxxx |
| Telegram | @your_support |

**Settings → Payment**
| Method | Account number | Holder |
|--------|----------------|--------|
| KBZ Pay | 09xxxxxxxxx | Your Name |
| Wave Pay | 09xxxxxxxxx | Your Name |

**Settings → General / Branding**
- Upload **logo** (Admin → Content or Settings branding if available)
- Home banners: **Admin → Content & Ads**

**Settings → Features**
- G2Bulk price alert: **Min 2%**, **Min $0.25**
- Enable: Games, Vouchers, Wallet, Promo codes

Save each tab.

---

## Step 3 — SMTP + Google OAuth (L3, L4)

### SMTP (L3)

**Option A — cPanel env / backend `.env`:**

```env
SMTP_HOST=mail.rankage.shop
SMTP_PORT=587
SMTP_USER=noreply@rankage.shop
SMTP_PASS=your-mailbox-password
SMTP_FROM=MVPMMSHOP <noreply@rankage.shop>
```

**Option B — Admin → Settings → Integrations** (same values)

**Test:** Admin → Settings → Integrations → **Send test email** to your inbox.

Forgot password: `https://rankage.shop/auth/forgot-password`

### Google OAuth (L4)

[Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Web client:

**Authorized JavaScript origins:**
- `https://rankage.shop`
- `https://www.rankage.shop`

**Authorized redirect URIs** (if using redirect flow):
- `https://rankage.shop`

Backend env: `GOOGLE_CLIENT_ID` = same as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

Mobile: same Web client ID in `mobile/src/config/google.ts` (release builds)

**Test:** Login with Google on web + mobile.

---

## Step 4 — Admin password (L6)

1. Login as `admin` / `admin123` (if not changed yet)
2. **Admin → Profile → Change password**
3. Strong password (16+ chars)
4. Log out and confirm old password **no longer works**

---

## Step 5 — Android release build (M2)

### One-time keystore

```powershell
cd mobile\android\app
keytool -genkeypair -v -storetype PKCS12 -keystore mvpmms-release.keystore -alias mvpmms -keyalg RSA -keysize 2048 -validity 10000
```

Copy `mobile/android/keystore.properties.example` → `keystore.properties` and fill passwords.

### Build

```powershell
cd mobile
npm ci
npm run build:android:aab    # Play Store
# or
npm run build:android:release   # APK sideload
```

Output: `mobile/android/app/build/outputs/`

Store listing: `mobile/docs/STORE_LISTING.md`

---

## Step 6 — FCM + VAPID (M3, web push)

### VAPID (web browser push)

On your PC:

```powershell
cd backend
npx web-push generate-vapid-keys
```

**Backend `.env` / cPanel API env:**

```env
VAPID_PUBLIC_KEY=BN...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@rankage.shop
```

**Frontend `.env.production`:**

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<same public key>
```

Restart **both** Node apps. Verify:
- `https://api.rankage.shop/push/vapid-public-key` → returns public key

Detail: `deploy/PUSH-PRODUCTION.md`

### FCM (mobile background push)

1. [Firebase Console](https://console.firebase.google.com/) → Android app `com.mvpmms`
2. Download `google-services.json` → `mobile/android/app/`
3. Service account JSON → backend env:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

4. Install mobile packages (see `mobile/docs/FCM_SETUP.md`)
5. Verify: `https://api.rankage.shop/push/fcm/status` → `{"configured":true}`

---

## After all steps

```powershell
powershell -ExecutionPolicy Bypass -File deploy\verify-prod.ps1
```

| Check | Expected |
|-------|----------|
| `/health` | 200 + ok:true |
| `/settings/shop` | shop JSON |
| Web home | 200 |
| Admin login | works |
| Google login | works |
| Test email | received |
| VAPID endpoint | public key |
| FCM status | configured (optional) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 404 LiteSpeed | Node.js app not running; wrong document root; Restart app |
| API CORS error | `CORS_ORIGINS` includes `https://rankage.shop` |
| Prisma EPERM local | Stop dev server → `npx prisma generate` |
| Google login fails | Origins in Console; client ID matches frontend env |
| No emails | SMTP test in admin; check spam folder |

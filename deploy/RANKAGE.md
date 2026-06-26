# rankage.shop Deployment Guide

> **cPanel shared hosting (your plan):** see **`deploy/CPANEL.md`** ← start here  
> VPS option: sections below / `deploy/nginx-rankage.shop.conf`

| Service | URL |
|---------|-----|
| Web + Admin | https://rankage.shop |
| API | https://api.rankage.shop |

Database: Neon PostgreSQL (configured in `backend/.env`).

---

## 1. DNS (domain registrar)

Point both records to your VPS public IP:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `<VPS_IP>` |
| A | `api` | `<VPS_IP>` |
| A | `www` | `<VPS_IP>` (optional) |

Wait 5–30 minutes for propagation.

---

## 2. Server setup (Ubuntu 22.04+)

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git

# PM2
sudo npm install -g pm2
```

Clone project to `/var/www/mvpmms` and copy env files from your local machine (never commit secrets).

---

## 3. Environment files

### `backend/.env`

```env
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
PORT=4000
JWT_SECRET=<long-random-string>
APP_BASE_URL=https://rankage.shop
CORS_ORIGINS=http://localhost:3000,https://rankage.shop,https://www.rankage.shop
GOOGLE_CLIENT_ID=1043403458086-....apps.googleusercontent.com
G2BULK_API_KEY=...
NODE_ENV=production
```

### `frontend/.env.production`

```env
NEXT_PUBLIC_API_URL=https://api.rankage.shop
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1043403458086-....apps.googleusercontent.com
```

---

## 4. Build & start

```bash
cd /var/www/mvpmms/backend
npm ci
npx prisma db push
npm run db:seed          # first time only — admin / admin123
npm run build

cd /var/www/mvpmms/frontend
npm ci
npm run build

cd /var/www/mvpmms
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 5. Nginx + HTTPS

```bash
sudo cp deploy/nginx-rankage.shop.conf /etc/nginx/sites-available/rankage.shop
sudo ln -sf /etc/nginx/sites-available/rankage.shop /etc/nginx/sites-enabled/
sudo nginx -t

# Get certificates (run before enabling SSL blocks if first time — comment ssl lines, use certbot standalone, or use certbot --nginx)
sudo certbot --nginx -d rankage.shop -d www.rankage.shop -d api.rankage.shop
sudo systemctl reload nginx
```

---

## 6. Google OAuth (Google Cloud Console)

Project: **ecommerce-c02c2**

1. **APIs & Services → Credentials → Web client**
2. **Authorized JavaScript origins:**
   - `https://rankage.shop`
   - `https://www.rankage.shop`
   - `http://localhost:3000` (local dev)
3. **Android client** (for mobile): add package name + SHA-1 fingerprint; add Android client ID to backend `GOOGLE_CLIENT_IDS` if needed.

---

## 7. Post-deploy checklist

- [ ] https://rankage.shop loads home page
- [ ] https://api.rankage.shop/settings/shop returns JSON
- [ ] Admin login: https://rankage.shop/admin/login (change default password!)
- [ ] Register / login / Google sign-in work
- [ ] Email reset links use `https://rankage.shop/auth/...`
- [ ] Upload payment proof + admin images load from `api.rankage.shop/uploads/`
- [ ] Mobile release build points to `https://api.rankage.shop` (release mode)

---

## 8. Mobile app

Release builds use `https://api.rankage.shop` automatically (`mobile/src/config/api.ts`).
Dev builds still use `10.0.2.2:4000` on Android emulator.

```bash
cd mobile
npm run android:release   # or build-release.ps1
```

---

## 9. Updates (redeploy)

```bash
cd /var/www/mvpmms
git pull
cd backend && npm ci && npx prisma db push && npm run build
cd ../frontend && npm ci && npm run build
pm2 restart rankage-api rankage-web
```

---

## 10. Monitoring

```bash
pm2 logs rankage-api
pm2 logs rankage-web
pm2 monit
```

Uptime checks: `https://rankage.shop` and `https://api.rankage.shop/settings/shop`

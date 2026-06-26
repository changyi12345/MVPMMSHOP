# Phase 0 Launch Checklist (L1–L6)

Complete these before public launch. Tick in admin or `.env` as noted.

| # | Item | Action | Verify |
|---|------|--------|--------|
| **L1** | Production deploy | Push code; on server: `npm ci`, `npx prisma db push`, `npm run build`, restart PM2/Node | https://rankage.shop loads; https://api.rankage.shop/health OK |
| **L2** | Database schema | Run `npx prisma db push` against prod (`DIRECT_URL` on Supabase pooler) | New tables: `G2BulkPriceSnapshot`, `G2BulkPriceAlert`; fields: `g2bulkAutoPriceSync`, `g2bulkPriceAlertMinPct` |
| **L3** | SMTP email | Admin → Settings → Integrations **or** `SMTP_*` in backend `.env` | Send test email; forgot-password + order emails deliver |
| **L4** | Google OAuth | Google Cloud Console: authorized origins `https://rankage.shop`, redirect/API for mobile web client ID | Login with Google on web + mobile |
| **L5** | Shop settings | Admin → Settings: logo, KBZ/Wave numbers, contact, tagline, payment methods | Home page shows logo/banners; checkout shows accounts |
| **L6** | Admin password | Login as `admin` / `admin123` → Profile → change password | Default seed password no longer works |

## Post-deploy (recommended)

| Item | Action |
|------|--------|
| G2Bulk price cron | Backend runs `@Cron` every 10 min — no extra setup after deploy |
| VAPID keys | `npx web-push generate-vapid-keys` → set `VAPID_*` + `NEXT_PUBLIC_VAPID_PUBLIC_KEY` on frontend |
| FCM | Firebase service account → `FIREBASE_SERVICE_ACCOUNT_JSON`; see `mobile/docs/FCM_SETUP.md` |
| Promo security | Promo CRUD only on `/admin/promos` (JWT + ADMIN); public `/promos/validate` only |

## Schema push (prod)

```bash
cd backend
# Use DIRECT_URL (port 5432) for db push on Supabase
npx prisma db push
npx prisma generate
npm run build
pm2 restart mvpmms-api   # or your process name
```

## Frontend env (production)

```env
NEXT_PUBLIC_API_URL=https://api.rankage.shop
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<same as VAPID_PUBLIC_KEY>
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

# MVPMMSHOP Feature List

## User Side Features

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Register/Login | ✅ Done | JWT auth, referral code on register |
| 2 | Top Up Products | ✅ Done | G2Bulk games API + MMK package prices |
| 3 | Cart | ✅ Done | Promo validation via API |
| 4 | Order History | ✅ Done | `GET /orders` — real API |
| 5 | Payment Upload | ✅ Done | `POST /orders/:id/payment-proof` |
| 6 | Order Tracking | ✅ Done | Status timeline on order detail |
| 7 | Referral System | ✅ Done | Auto code, stats API, Telegram/Facebook share |
| 8 | Wallet | ✅ Done | Balance, top-up, pay at checkout |
| 9 | Vouchers & Gift Cards | ✅ Done | G2Bulk API + MMK prices (Ks) |
| 10 | FAQ / Help / Terms / Privacy | ✅ Done | `/faq`, `/help`, `/terms`, `/privacy` + footer/profile links |
| 11 | Forgot Password / Email Verify | ✅ Done | Reset + verify endpoints + frontend pages |
| 12 | SEO | ✅ Done | Dynamic title/description from shop settings |
| 13 | MM i18n | ✅ Done | Wallet, Cart, Login, order status badges translated |
| 14 | Referral Share | ✅ Done | Telegram + Facebook share URLs |

## Admin Side Features

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Dashboard | ✅ Done | Stats, today sales/orders, active promos, 7-day chart |
| 2 | Product Management | ✅ Done | G2Bulk sync, hide/show, MMK pricing |
| 3 | Order Management | ✅ Done | Filter, search, status, detail modal, CSV export |
| 4 | User Management | ✅ Done | Search, role, wallet adjust, view orders |
| 5 | Payment Verification | ✅ Done | Order payment proof verify/reject |
| 6 | Wallet Management | ✅ Done | Pending top-ups + all transactions tabs |
| 7 | Sales Report | ✅ Done | Date range filter, monthly + top products + CSV |
| 8 | Promo Code | ✅ Done | Admin CRUD on `/admin/promos` (JWT+ADMIN); public `POST /promos/validate` only |
| 9 | Exchange Rate Settings | ✅ Done | USD→MMK + markup on Products & Settings |
| 10 | Settings Page | ✅ Done | General, currency, payment accounts (no/holder) |
| 11 | Referral Stats | ✅ Done | `/admin/referrals` leaderboard + CSV export |
| 12 | Activity Log | ✅ Done | `/admin/activity` admin action audit trail |
| 13 | Mobile Admin Nav | ✅ Done | Hamburger sidebar on small screens |
| 14 | Admin Login | ✅ Done | `/admin/login` — ADMIN role only |
| 15 | Admin Profile | ✅ Done | Edit profile, change password, logout |
| 16 | Admin Auth Guard | ✅ Done | JWT + ADMIN role on all `/admin/*` APIs |
| 17 | Route Middleware | ✅ Done | Next.js middleware — auth, admin, maintenance |
| 18 | Admin Notifications | ✅ Done | Sound + toast + bell — orders & wallet top-ups |
| 19 | Content & Ads CMS | ✅ Done | Logo, banner ads, event posts — `/admin/content` |
| 20 | Home Banners | ✅ Done | Hero carousel + mid-page ads from admin |
| 21 | Events & News | ✅ Done | `/events` list + `/events/[slug]` detail pages |
| 22 | Admin i18n | ✅ Partial | Sidebar + Settings tabs EN/MM |
| 23 | G2Bulk Auto Top-Up | ✅ Done | Auto fulfill on payment verify via G2Bulk API |
| 24 | Email Notifications | ✅ Done | Order complete + wallet approve (SMTP or dev log) |
| 25 | Rate Limit / Upload Security | ✅ Done | Auth + upload rate limits, 3MB image validation |
| 26 | Mobile CMS + Wallet API | ✅ Partial | Home banners/logo, real wallet API, basic i18n |
| 27 | Automated Tests | ✅ Partial | Auth service unit tests |
| 28 | Production Deploy Docs | ✅ Done | See `deploy/` folder + `deploy/LAUNCH-CHECKLIST.md` |
| 29 | G2Bulk price alerts + auto sync | ✅ Done | Cron every 10 min; dashboard reads alerts only (non-blocking) |

---

## Phase 0 — Live Launch (လုပ်ရသေး)

| # | Item | Status | Notes |
|---|------|--------|-------|
| L1 | Production deploy | ⏳ | `api.rankage.shop` + `rankage.shop` live, SSL, Node Restart |
| L2 | Supabase DB | ✅ | Schema + seed on Supabase (`aws-1-ap-southeast-1` pooler) |
| L3 | SMTP email (production) | ⏳ | Admin Settings or `.env` — forgot password, order emails |
| L4 | Google OAuth (production) | ⏳ | Console origins: `rankage.shop`, `api.rankage.shop` |
| L5 | Shop settings | ⏳ | Logo, KBZ/Wave account numbers, contact, tagline |
| L6 | Change default admin password | ⏳ | `admin123` → strong password after first login |

---

## Phase 1 — Roadmap (လိုအပ်သော Features)

> **KBZ Pay / Wave Pay auto gateway** — API မရသေးလို့ **Phase 2 (Future)** မှာ ထားပါ။ လက်ရှိ manual proof upload ဆက်သုံးမည်။

### User & Orders

| # | Feature | Priority | Status | Scope |
|---|---------|----------|--------|-------|
| R1 | **User order cancel** | High | ✅ Done | `POST /orders/:id/cancel` — PENDING/PAYMENT_PENDING, stock restore, batch cancel |
| R2 | **Refund flow UI** | High | ✅ Done | `POST /admin/orders/:id/refund` → wallet credit + email; status `REFUNDED` |
| R3 | **Push notifications (web)** | Medium | ✅ Done | Service Worker + VAPID; order complete & top-up approved |
| R4 | **SMS OTP / alerts** | Medium | ✅ Done | Twilio SMS service; `POST /auth/phone/send-otp` & verify; register + profile UI; order complete SMS (feature flags) |
| R5 | **Customer support chat** | Medium | ✅ Partial | Telegram + Live Chat URL in Admin Settings; footer links |
| R6 | **Multi-language CMS content** | Medium | ✅ Done | FAQ / Terms / Help / Privacy — `sectionsMm` + EN in admin; `?lang=mm` on public API |
| R7 | **Dark mode** | Low | ❌ Todo | Theme toggle; CSS variables; persist preference (`localStorage`) |
| R8 | **Google Analytics** | Low | ✅ Done | `NEXT_PUBLIC_GA_ID`; page views + checkout/login/sign_up events |

### Admin & Security

| # | Feature | Priority | Status | Scope |
|---|---------|----------|--------|-------|
| R9 | **Admin 2FA** | High | ✅ Done | TOTP setup in Admin Profile; login 2FA step; backup codes |
| R10 | **G2Bulk low balance alert** | High | ✅ Done | Threshold in Admin → Features; warning on dashboard |
| R11 | **Admin visitor / analytics** | Medium | ❌ Todo | Simple admin page: orders/day, new users, top games; or embed GA summary |
| R12 | **Admin i18n (full MM)** | Medium | ⏳ Partial | Products, Orders, Users, Reports pages — MM labels (sidebar done) |
| R13 | **User inbox + admin broadcast** | Medium | ✅ Done | Inbox bell + `/notifications`; admin → Send Notifications; order/wallet/refund auto-inbox + push |
| R14 | **Admin feature toggles** | High | ✅ Done | Admin Settings → Features — enable/disable shop features + payment methods |

### Mobile App

| # | Feature | Priority | Status | Scope |
|---|---------|----------|--------|-------|
| M1 | **Connect `api.rankage.shop`** | High | ✅ Done | `mobile/src/config/api.ts` — prod API in release builds |
| M2 | **Release build (Android)** | High | ⏳ Ready | `npm run build:android:release` / `build:android:aab`; keystore + `mobile/docs/STORE_LISTING.md` |
| M3 | **Push notifications (mobile)** | Medium | ⏳ Scaffold | Backend FCM + `POST /push/fcm/register`; mobile `lib/push.ts` — see `mobile/docs/FCM_SETUP.md` |
| M4 | **Offline / error UX** | Medium | ✅ Done | API retry, shop/home cache, NetworkErrorView + retry on key screens |
| M5 | **Google Play publish** | Low | ⏳ Docs | Store listing template in `mobile/docs/STORE_LISTING.md` |
| M6 | **App Store (iOS)** | Low | ⏳ Docs | Same doc + Apple Developer setup notes |
| M7 | **Notification inbox bell** | Medium | ✅ Done | Bell + unread badge; `/notifications` screen; mark read |
| M8 | **Register + SMS OTP** | High | ✅ Done | Separate Register screen; phone OTP when `smsOtpEnabled`; profile verify |
| M9 | **UI theme (violet/cyan)** | Low | ✅ Done | All screens + shared `screenStyles.ts` / `ScreenHeader` |
| M10 | **MM i18n** | Medium | ⏳ Expanded | Tab bar, auth, orders, profile, cart promo, legal EN/MM |
| M11 | **Order cancel** | High | ✅ Done | Orders list + order detail; respects `userOrderCancelEnabled` |
| M12 | **Guest browse** | High | ✅ Done | Home/games/vouchers/cart without login; checkout requires auth |
| M13 | **Cart promo code** | Medium | ✅ Done | `POST /promos/validate` in mobile cart |
| M14 | **Forgot password** | Medium | ✅ Done | Email reset link via `/auth/forgot-password` |
| M15 | **Legal pages** | Medium | ✅ Done | FAQ, terms, privacy from `/content/legal/:slug` |
| M16 | **Events & News** | Medium | ✅ Done | Home section + list/detail screens |
| M17 | **Vouchers tab + filters** | High | ✅ Done | Tab, category browse, search/filter chips |

### Quality & Ops

| # | Feature | Priority | Status | Scope |
|---|---------|----------|--------|-------|
| Q1 | **Automated tests (E2E)** | Medium | ⏳ Partial | Playwright: login, checkout, admin verify payment |
| Q2 | **Automated tests (API)** | Medium | ⏳ Partial | Promos validate unit tests; orders/auth specs |
| Q3 | **UI theme consistency** | Low | ✅ Mobile done | Violet/cyan unified across all mobile screens; web admin optional |

---

## Phase 2 — Future (API ရပြီးမှ)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| F1 | **KBZ Pay auto gateway** | 🔮 Future | Merchant API ရလျှင်: create payment → webhook → auto-verify order |
| F2 | **Wave Pay auto gateway** | 🔮 Future | Same flow as KBZ; reduce manual proof upload |
| F3 | **Unified payment webhook** | 🔮 Future | Single `/webhooks/payment` handler for KBZ/Wave/other |

---

## Suggested build order

```
1. Phase 0 — Live launch (deploy, SMTP, OAuth, shop settings)
2. R1 User order cancel
3. R2 Refund flow
4. R9 Admin 2FA
5. R10 G2Bulk low balance alert
6. R3/R13 Push notifications
7. R4 SMS OTP
8. R6 Multi-language CMS
9. M1–M2 Mobile release build
10. R8 Analytics, R7 Dark mode, F1–F2 Payment gateways (when API ready)
```

---

## API Endpoints (Backend — port 4000)

```
Auth:     POST /auth/register, POST /auth/login
          POST /auth/forgot-password, POST /auth/reset-password
          POST /auth/verify-email, POST /auth/resend-verification
          POST /auth/admin-2fa/verify
          GET /auth/me, PATCH /auth/profile, PUT /auth/change-password
          GET /admin/2fa/status, POST /admin/2fa/setup, /enable, /disable
          GET /push/vapid-public-key, POST /push/subscribe, DELETE /push/subscribe
Games:    GET /games, GET /games/:code, POST /games/:code/validate
Vouchers: GET /vouchers/categories, GET /vouchers, GET /vouchers/:id
Orders:   POST /orders, GET /orders, GET /orders/:id, POST /orders/:id/payment-proof
          POST /orders/:id/cancel
Wallet:   GET /wallet, POST /wallet/topup
Referral: GET /referral
Promos:   POST /promos/validate (public)
          GET/POST/PUT/DELETE /admin/promos (admin only)
Settings: GET /settings/exchange, GET /settings/shop
Content:  GET /content/home, GET /content/events, GET /content/events/:slug
Admin:    GET /admin/dashboard, /admin/notifications, /admin/orders, /admin/orders/:id
          GET /admin/users, /admin/users/:id/orders
          PUT /admin/users/:id/role, /admin/users/:id/wallet
          GET/PUT /admin/settings/exchange, /admin/settings/shop
          GET /admin/wallet/topups
          POST /admin/wallet/topups/:id/verify, /reject
          GET /admin/reports/sales?from=&to=
          GET /admin/activity, /admin/referrals
          GET /admin/wallet/transactions
          POST /admin/orders/:id/verify-payment, /reject-payment, /refund
          PUT /admin/orders/:id/status, /admin/products/toggle-active
          POST /admin/upload, /admin/upload/base64
          PUT /admin/branding
          GET/POST/PUT/DELETE /admin/banners, /admin/banners/:id
          GET/POST/PUT/DELETE /admin/events, /admin/events/:id
          GET/POST/PUT/DELETE /admin/promos, /admin/promos/:id
          POST /admin/g2bulk/check-prices, GET /admin/g2bulk/price-alerts
```

## Color Palette (User UI — 2026)

- Brand Indigo `#6366f1` · Cyan `#06b6d4` · Purple `#8b5cf6`
- Background `#f1f5f9` · Text `#0f172a`
- Admin UI: legacy gold/dark (optional refresh)

## Tech Stack
- Backend: NestJS, Prisma, PostgreSQL (port 4000)
- Frontend: Next.js 14, React (port 3000)
- Mobile: React Native (Android emulator → 10.0.2.2:4000)

## Setup

```bash
# Backend
cd backend
npx prisma db push
npm run db:seed   # creates admin user: admin / admin123
npm run start:dev

# Frontend
cd frontend
npm run dev
```

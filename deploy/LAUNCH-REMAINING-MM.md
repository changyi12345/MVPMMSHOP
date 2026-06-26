# Launch — ကျန်ရှိ checklist

## 📧 Email (spam လျော့ချין)

| Item | Action | Status |
|------|--------|--------|
| Reply-To | Admin → Settings → **Contact email** = `mvpmmshop@rankage.shop` | ⏳ |
| SPF + DKIM | cPanel → Email Deliverability | ⏳ |
| DMARC | DNS `_dmarc` — see `deploy/EMAIL-DNS.md` | ⏳ |
| mail-tester | Score 8+ | ⏳ |
| Real subjects | Order/reset emails OK; test mail updated in code | ✅ |

## 📱 Android release

| Item | Action |
|------|--------|
| Keystore | `keytool` → `mobile/android/app/mvpmms-release.keystore` |
| Config | Copy `keystore.properties.example` → `keystore.properties` |
| Build | `cd mobile && npm run build:android:aab` |
| Listing | `mobile/docs/STORE_LISTING.md` |

## 🛡️ Security

| Item | Action |
|------|--------|
| Admin 2FA | Admin → Profile → Enable TOTP |
| G2Bulk alerts | Settings → 2% + $0.25 |
| Prod secrets | JWT, DB, SMTP — cPanel env only |

## 📝 Content (Admin → Content / Settings)

| Item | Action |
|------|--------|
| Hero banners | Upload 2–3 carousel images |
| FAQ / Terms / Privacy | EN + MM sections |
| Events | 1–2 promo posts |
| Payment | KBZ/Wave numbers verified in Settings → Payment |

## 🚀 Prod deploy

See `deploy/RUN-LAUNCH-6-MM.md` — zip upload + Node restart on cPanel.

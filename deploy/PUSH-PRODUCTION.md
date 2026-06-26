# Push Notifications — Production Setup

Web (VAPID) and mobile (FCM) use separate credentials. Both are optional; inbox API works without push.

## Web Push (VAPID)

### 1. Generate keys

```bash
cd backend
npx web-push generate-vapid-keys
```

### 2. Backend `.env`

```env
VAPID_PUBLIC_KEY=BN...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@rankage.shop
```

### 3. Frontend `.env.production`

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<same public key as backend>
```

Restart API + rebuild frontend. Users can allow notifications in browser; order complete / wallet approved triggers push.

Verify: logged-in user subscribes; check backend logs for no VAPID warning on startup.

---

## Mobile FCM

See **`mobile/docs/FCM_SETUP.md`** for Gradle + `google-services.json`.

### Backend

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Paste full JSON on one line (escape quotes if needed in cPanel env UI).

Verify: `GET https://api.rankage.shop/push/fcm/status` → `{ "configured": true }`

---

## cPanel notes

- Add `VAPID_*` and `FIREBASE_SERVICE_ACCOUNT_JSON` in Node app environment variables
- Restart application after saving
- Do not commit real keys to git — use `deploy/backend.env.cpanel` as template only

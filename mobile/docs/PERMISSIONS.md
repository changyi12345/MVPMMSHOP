# Mobile App Permissions (Android)

Package: `com.mvpmms` · Target SDK 34

## Declared permissions (`AndroidManifest.xml`)

| Permission | Purpose | Web equivalent |
|------------|---------|----------------|
| `INTERNET` | API calls to `api.rankage.shop` | Browser fetch |
| `ACCESS_NETWORK_STATE` | Detect offline / show retry UI | Browser online events |
| `READ_MEDIA_IMAGES` (API 33+) | Pick payment proof from gallery | `<input type="file">` |
| `READ_EXTERNAL_STORAGE` (API ≤32) | Legacy gallery access | Same |
| `CAMERA` | Take photo of payment receipt | Mobile browser camera capture |
| `POST_NOTIFICATIONS` (API 33+) | Order / wallet push alerts | Web Push (VAPID) |
| `VIBRATE` | Notification vibration | Browser notification |
| `WAKE_LOCK` | FCM delivery (when Firebase linked) | Service Worker |

Optional hardware: `android.hardware.camera` — **not required** (gallery-only devices still work).

## Runtime requests (`src/lib/permissions.ts`)

| When | Permission |
|------|------------|
| Upload payment proof → Gallery | `READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE` |
| Upload payment proof → Camera | `CAMERA` |
| After login (FCM scaffold) | `POST_NOTIFICATIONS` (Android 13+) |

User sees localized rationale dialogs (EN/MM via `i18n.ts`).

## Network security

`res/xml/network_security_config.xml`:

- **Release:** HTTPS only (`api.rankage.shop`)
- **Debug:** cleartext allowed for `10.0.2.2` / `localhost` (emulator dev API)

## Not included (by design)

| Item | Reason |
|------|--------|
| `WRITE_EXTERNAL_STORAGE` | Not needed — uploads go to API, not device storage |
| `ACCESS_FINE_LOCATION` | Shop has no location features |
| `READ_CONTACTS` / `SMS` | SMS OTP is server-sent; app does not read SMS |
| Admin panel | Web-only (`/admin/*`) — not in mobile app |
| iOS permissions | No `ios/` folder yet — Android-first release |

## Play Store declaration hints

- **Photos:** “Upload payment transfer screenshot”
- **Camera:** “Take photo of payment receipt”
- **Notifications:** “Order status and wallet updates”

See also: `FCM_SETUP.md`, `STORE_LISTING.md`

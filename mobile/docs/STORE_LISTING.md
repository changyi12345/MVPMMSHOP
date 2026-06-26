# App Store / Play Store (M5, M6)

## Android release (M2)

```powershell
cd mobile
npm run build:android:release          # APK
npm run build:android:release -- -Target aab   # Play Store AAB
```

Keystore: copy `android/keystore.properties.example` → `android/keystore.properties`.

## Google Play (M5)

| Field | Suggested value |
|-------|-----------------|
| App name | MVPMMSHOP — Game Top Up |
| Short description | Fast MLBB & game top-up, wallet, vouchers. MMK payments. |
| Full description | Top up Mobile Legends and popular games instantly. Pay with KBZ Pay, Wave Pay, or wallet. Track orders, get notifications, refer friends. |
| Category | Shopping |
| Content rating | Everyone |
| Privacy policy URL | https://rankage.shop/privacy |
| Support email | From Admin → Settings contact email |
| Screenshots | Home, Games, Checkout, Orders, Profile (1080×1920) |
| Feature graphic | 1024×500 brand gradient banner |

Upload AAB from `mobile/android/app/build/outputs/bundle/release/`.

## App Store (M6)

1. Apple Developer account ($99/yr)
2. Bundle ID: `com.mvpmms.shop` (create in Certificates)
3. `cd mobile/ios && pod install` (after Firebase iOS setup)
4. Archive in Xcode → App Store Connect
5. Same metadata as Play Store + age rating questionnaire

## Pre-submission checklist

- [ ] Production API: `https://api.rankage.shop`
- [ ] Google OAuth iOS/Android client IDs configured
- [ ] Release keystore backed up securely
- [ ] Admin default password changed
- [ ] SMS OTP / Twilio tested if enabled

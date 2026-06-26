# FCM Push Notifications (M3)

Mobile inbox works without FCM (bell + `/notifications` API). For **background push** on Android/iOS:

## 1. Firebase project

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Add Android app with package `com.mvpmms`
3. Download `google-services.json` → `mobile/android/app/google-services.json`

## 2. Mobile packages

```bash
cd mobile
npm install @react-native-firebase/app @react-native-firebase/messaging @react-native-async-storage/async-storage
```

## 3. Android Gradle

In `mobile/android/build.gradle` dependencies:

```gradle
classpath 'com.google.gms:google-services:4.4.2'
```

In `mobile/android/app/build.gradle` (bottom):

```gradle
def googleServices = file('google-services.json')
if (googleServices.exists()) {
    apply plugin: 'com.google.gms.google-services'
}
```

## 4. Backend

Set in `backend/.env`:

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Paste the full JSON from Firebase → Project settings → Service accounts → Generate new private key (single line or escaped).

Restart API. `GET /push/fcm/status` should return `{ "configured": true }`.

## 5. Test

1. Log in on device/emulator with Google Play services
2. App calls `initPushNotifications()` after login
3. Admin → Notifications → send broadcast
4. Device should receive FCM + inbox entry

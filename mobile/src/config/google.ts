/**
 * Google Sign-In — OAuth client IDs from Google Cloud Console.
 *
 * webClientId (WEB type): required in GoogleSignin.configure — backend verifies idToken with this.
 * Android client: Cloud Console only (package com.mvpmms + release SHA-1) — not passed to configure().
 */
export const GOOGLE_WEB_CLIENT_ID =
  '1043403458086-fa28d81odsntn6touqttjlqhltdo8tvp.apps.googleusercontent.com';

/** Android OAuth client — linked via package + SHA-1 in Cloud Console (reference only). */
export const GOOGLE_ANDROID_CLIENT_ID =
  '1043403458086-47cucscq0cb5eafl5bglr53dglpbbi07.apps.googleusercontent.com';

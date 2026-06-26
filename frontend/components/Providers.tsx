'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './Toast';
import AuthCookieSync from './AuthCookieSync';
import ShopProvider from './ShopProvider';
import UserNotificationProvider from './UserNotificationProvider';
import GoogleAnalytics from './GoogleAnalytics';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export default function Providers({ children }: { children: React.ReactNode }) {
  const inner = (
    <ToastProvider>
      <ShopProvider>
        <UserNotificationProvider>
          <GoogleAnalytics />
          <AuthCookieSync />
          {children}
        </UserNotificationProvider>
      </ShopProvider>
    </ToastProvider>
  );

  if (!googleClientId) return inner;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {inner}
    </GoogleOAuthProvider>
  );
}

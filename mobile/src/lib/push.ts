import { Platform } from 'react-native';
import { registerFcmToken } from '../api/push';

let cachedToken: string | null = null;

/**
 * Initialize FCM when @react-native-firebase/messaging is installed and configured.
 * See mobile/docs/FCM_SETUP.md for google-services.json setup.
 */
export async function initPushNotifications(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const messaging = require('@react-native-firebase/messaging').default as {
      (): {
        requestPermission: () => Promise<number>;
        getToken: () => Promise<string>;
        onTokenRefresh: (cb: (token: string) => void) => () => void;
      };
    };
    const msg = messaging();
    if (Platform.OS === 'ios') {
      await msg.requestPermission();
    }
    const token = await msg.getToken();
    if (token && token !== cachedToken) {
      cachedToken = token;
      await registerFcmToken(token);
    }
    msg.onTokenRefresh(async (newToken: string) => {
      cachedToken = newToken;
      await registerFcmToken(newToken).catch(() => {});
    });
  } catch {
    // Firebase not linked — inbox notifications still work via API polling
  }
}

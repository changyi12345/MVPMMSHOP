import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { t } from '../i18n';

type AndroidPermission = (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS];

async function requestAndroidPermission(
  permission: AndroidPermission,
  title: string,
  message: string,
): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const already = await PermissionsAndroid.check(permission);
  if (already) return true;

  const result = await PermissionsAndroid.request(permission, {
    title,
    message,
    buttonPositive: t('allow'),
    buttonNegative: t('deny'),
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/** Gallery access for payment proof upload (Android 13+ READ_MEDIA_IMAGES). */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  if (Platform.Version >= 33) {
    return requestAndroidPermission(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      t('permPhotosTitle'),
      t('permPhotosMessage'),
    );
  }

  if (Platform.Version >= 23) {
    return requestAndroidPermission(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      t('permPhotosTitle'),
      t('permPhotosMessage'),
    );
  }

  return true;
}

/** Camera access for taking payment receipt photos. */
export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return requestAndroidPermission(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    t('permCameraTitle'),
    t('permCameraMessage'),
  );
}

/** Push notifications (Android 13+ POST_NOTIFICATIONS). */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  if (Platform.Version >= 33) {
    return requestAndroidPermission(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      t('permNotifTitle'),
      t('permNotifMessage'),
    );
  }

  return true;
}

export function showPermissionDeniedAlert(kind: 'photos' | 'camera' | 'notifications') {
  const key =
    kind === 'photos' ? 'permPhotosDenied' : kind === 'camera' ? 'permCameraDenied' : 'permNotifDenied';
  Alert.alert(t('permRequired'), t(key));
}

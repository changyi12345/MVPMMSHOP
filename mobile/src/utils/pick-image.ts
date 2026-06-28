import { Alert } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  PhotoQuality,
} from 'react-native-image-picker';
import {
  requestCameraPermission,
  requestMediaLibraryPermission,
  showPermissionDeniedAlert,
} from '../lib/permissions';
import { t } from '../i18n';

export type PickedImage = {
  uri: string;
  type?: string;
  base64?: string;
};

const PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  quality: 0.85 as PhotoQuality,
  maxWidth: 1600,
  selectionLimit: 1,
  includeBase64: true,
};

function parseResponse(response: ImagePickerResponse): PickedImage | null {
  if (response.didCancel || response.errorCode) return null;
  const asset = response.assets?.[0];
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    base64: asset.base64 ?? undefined,
  };
}

function pickFromLibrary(): Promise<PickedImage | null> {
  return new Promise((resolve) => {
    launchImageLibrary(PICKER_OPTIONS, (response) => {
      resolve(parseResponse(response));
    });
  });
}

function pickFromCamera(): Promise<PickedImage | null> {
  return new Promise((resolve) => {
    launchCamera(PICKER_OPTIONS, (response) => {
      resolve(parseResponse(response));
    });
  });
}

/** Pick payment proof — gallery or camera (matches web file upload use case). */
export async function pickPaymentProofImage(): Promise<PickedImage | null> {
  return new Promise((resolve) => {
    Alert.alert(t('uploadProof'), t('pickProofSource'), [
      {
        text: t('pickFromGallery'),
        onPress: async () => {
          const ok = await requestMediaLibraryPermission();
          if (!ok) {
            showPermissionDeniedAlert('photos');
            resolve(null);
            return;
          }
          resolve(await pickFromLibrary());
        },
      },
      {
        text: t('pickFromCamera'),
        onPress: async () => {
          const ok = await requestCameraPermission();
          if (!ok) {
            showPermissionDeniedAlert('camera');
            resolve(null);
            return;
          }
          resolve(await pickFromCamera());
        },
      },
      { text: t('no'), style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

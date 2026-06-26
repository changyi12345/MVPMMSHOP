import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';

export type PickedImage = {
  uri: string;
  type?: string;
};

export function pickPaymentProofImage(): Promise<PickedImage | null> {
  return new Promise((resolve) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.85,
        maxWidth: 1600,
        selectionLimit: 1,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) {
          resolve(null);
          return;
        }
        const asset = response.assets?.[0];
        if (!asset?.uri) {
          resolve(null);
          return;
        }
        resolve({
          uri: asset.uri,
          type: asset.type ?? 'image/jpeg',
        });
      },
    );
  });
}

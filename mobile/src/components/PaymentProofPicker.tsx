import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { t } from '../i18n';
import { pickPaymentProofImage, PickedImage } from '../utils/pick-image';

interface Props {
  value: PickedImage | null;
  onChange: (picked: PickedImage | null) => void;
  uploading?: boolean;
}

export default function PaymentProofPicker({ value, onChange, uploading }: Props) {
  const pick = async () => {
    const picked = await pickPaymentProofImage();
    if (picked) onChange(picked);
  };

  return (
    <TouchableOpacity
      style={[styles.zone, value && styles.zoneFilled]}
      onPress={pick}
      activeOpacity={0.85}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator color={colors.violet} />
      ) : value ? (
        <>
          <Image source={{ uri: value.uri }} style={styles.preview} resizeMode="cover" />
          <View style={styles.previewOverlay}>
            <Text style={styles.changeText}>{t('tapToChangePhoto')}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>📷</Text>
          </View>
          <Text style={styles.label}>{t('chooseScreenshot')}</Text>
          <Text style={styles.hint}>{t('paymentProofHint')}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  zone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(99, 102, 241, 0.35)',
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
    minHeight: 140,
    overflow: 'hidden',
  },
  zoneFilled: {
    padding: 0,
    borderStyle: 'solid',
    borderColor: colors.violet,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 28 },
  label: { fontWeight: '700', color: colors.text, fontSize: 15 },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  preview: { width: '100%', height: 180 },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  changeText: { color: colors.white, fontSize: 13, fontWeight: '600' },
});

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { getLang, setLang, t } from '../i18n';
import { persistLang } from '../api/authStorage';

interface Props {
  onChange?: () => void;
  light?: boolean;
}

export default function LangToggle({ onChange, light }: Props) {
  const lang = getLang();
  const next = lang === 'en' ? 'mm' : 'en';

  return (
    <TouchableOpacity
      style={[styles.btn, light && styles.btnLight]}
      onPress={() => {
        setLang(next);
        persistLang(next);
        onChange?.();
      }}
    >
      <Text style={[styles.text, light && styles.textLight]}>{lang === 'en' ? t('langMm') : t('langEn')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderColor: colors.borderBrand,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surfaceMuted,
  },
  text: { color: colors.violet, fontSize: 12, fontWeight: '700' },
  btnLight: {
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  textLight: { color: colors.white },
});

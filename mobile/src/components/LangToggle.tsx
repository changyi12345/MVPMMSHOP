import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { getLang, setLang, t } from '../i18n';
import { persistLang } from '../api/authStorage';

interface Props {
  onChange?: () => void;
}

export default function LangToggle({ onChange }: Props) {
  const lang = getLang();
  const next = lang === 'en' ? 'mm' : 'en';

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => {
        setLang(next);
        persistLang(next);
        onChange?.();
      }}
    >
      <Text style={styles.text}>{lang === 'en' ? t('langMm') : t('langEn')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderColor: colors.violetLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  text: { color: colors.violetLight, fontSize: 12, fontWeight: '700' },
});

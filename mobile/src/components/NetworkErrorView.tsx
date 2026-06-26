import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { t } from '../i18n';

type Props = {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export default function NetworkErrorView({ message, onRetry, compact }: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.title}>{t('networkErrorTitle')}</Text>
      <Text style={styles.msg}>{message ?? t('networkErrorBody')}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.btnText}>{t('retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  wrapCompact: {
    paddingVertical: spacing.lg,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  msg: {
    color: colors.darkGray,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  btn: {
    backgroundColor: colors.violet,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  btnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VoucherCategory } from '../api/vouchers';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { t } from '../i18n';
import CircleImage from './CircleImage';

interface Props {
  category: VoucherCategory;
  onPress: () => void;
  compact?: boolean;
  home?: boolean;
}

export default function VoucherCategoryCard({ category, onPress, compact, home }: Props) {
  const size = compact ? 72 : 96;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.compact, home && styles.home]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
        {category.imageUrl ? (
          <CircleImage uri={category.imageUrl} size={size} />
        ) : (
          <CircleImage
            size={size}
            fallback={<Text style={styles.fallbackIcon}>🎁</Text>}
          />
        )}
      </View>
      <Text style={styles.name} numberOfLines={compact ? 2 : 3}>{category.title}</Text>
      {!compact && (
        <Text style={styles.meta}>{category.productCount} {t('products')}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    ...shadows.sm,
  },
  compact: { width: 148, marginRight: spacing.md, marginBottom: 0 },
  home: {
    borderTopWidth: 3,
    borderTopColor: colors.pink,
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    minHeight: 96,
  },
  imageWrapCompact: { minHeight: 72 },
  fallbackIcon: { fontSize: 36 },
  name: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4, textAlign: 'center' },
  meta: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});

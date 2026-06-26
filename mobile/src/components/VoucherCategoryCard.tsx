import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { VoucherCategory } from '../api/vouchers';
import { colors, spacing, radius } from '../theme/colors';
import { t } from '../i18n';

interface Props {
  category: VoucherCategory;
  onPress: () => void;
  compact?: boolean;
}

export default function VoucherCategoryCard({ category, onPress, compact }: Props) {
  const size = compact ? 64 : 96;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.compact]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
        {category.imageUrl ? (
          <Image
            source={{ uri: category.imageUrl }}
            style={{ width: size, height: size, borderRadius: radius.sm }}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.fallbackIcon}>🎁</Text>
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
    borderColor: colors.surfaceAlt,
  },
  compact: { width: 148, marginRight: spacing.md, marginBottom: 0 },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    minHeight: 96,
  },
  imageWrapCompact: { minHeight: 64 },
  fallbackIcon: { fontSize: 40 },
  name: { fontSize: 16, fontWeight: '600', color: colors.white, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.darkGray },
});

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { VoucherProduct } from '../api/vouchers';
import { formatMmk } from '../data/mockData';
import { colors, spacing, radius } from '../theme/colors';
import { t } from '../i18n';

interface Props {
  voucher: VoucherProduct;
  onPress: () => void;
}

export default function VoucherCard({ voucher, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        <View style={styles.imageWrap}>
          {voucher.imageUrl ? (
            <Image
              source={{ uri: voucher.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.fallbackIcon}>🎫</Text>
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>{voucher.title}</Text>
          <Text style={styles.price}>{formatMmk(voucher.unitPrice)}</Text>
          <Text style={[styles.stock, !voucher.inStock && styles.outOfStock]}>
            {voucher.inStock ? `${t('inStock')} (${voucher.stock})` : t('outOfStock')}
          </Text>
        </View>
      </View>
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
  row: { flexDirection: 'row', gap: spacing.md },
  imageWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  image: { width: 72, height: 72, borderRadius: radius.sm },
  fallbackIcon: { fontSize: 32 },
  body: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: colors.white, marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '700', color: colors.cyan, marginBottom: 4 },
  stock: { fontSize: 12, color: colors.darkGray },
  outOfStock: { color: colors.red },
});

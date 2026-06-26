import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { fetchVoucher, formatFaceValue, VoucherProduct } from '../api/vouchers';
import { formatMmk } from '../data/mockData';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { addToCart, buyNow } from '../lib/cart-store';
import { subscribeLang, t } from '../i18n';

interface Props {
  voucherId: number;
  onBack: () => void;
  onCheckout: () => void;
}

export default function VoucherDetailScreen({ voucherId, onBack, onCheckout }: Props) {
  const [voucher, setVoucher] = useState<VoucherProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [, langBump] = useState(0);
  useEffect(() => subscribeLang(() => langBump((n) => n + 1)), []);

  useEffect(() => {
    setLoading(true);
    fetchVoucher(voucherId)
      .then(setVoucher)
      .catch(() => setVoucher(null))
      .finally(() => setLoading(false));
  }, [voucherId]);

  const buildItem = () => {
    if (!voucher) return null;
    return {
      type: 'voucher' as const,
      name: voucher.title,
      price: voucher.unitPrice,
      g2bulkProductId: voucher.id,
      quantity,
    };
  };

  const handleAddToCart = () => {
    const item = buildItem();
    if (!item || !voucher?.inStock) return;
    addToCart(item);
    Alert.alert(t('addedToCart'), voucher.title);
  };

  const handleBuyNow = () => {
    const item = buildItem();
    if (!item || !voucher?.inStock) return;
    buyNow(item);
    onCheckout();
  };

  if (loading) {
    return (
      <View style={[screen.root, styles.center]}>
        <ActivityIndicator color={colors.violet} size="large" />
      </View>
    );
  }

  if (!voucher) {
    return (
      <View style={screen.root}>
        <ScreenHeader title={t('vouchers')} onBack={onBack} />
        <Text style={[screen.emptyText, { marginTop: spacing.xl }]}>{t('voucherNotFound')}</Text>
      </View>
    );
  }

  const faceValue = formatFaceValue(voucher.faceValue, voucher.title);
  const total = voucher.unitPrice * quantity;
  const maxQty = Math.max(1, voucher.stock || 1);

  return (
    <View style={screen.root}>
      <ScreenHeader title={voucher.title} onBack={onBack} />
      <ScrollView contentContainerStyle={screen.content}>
        <View style={styles.card}>
          <View style={styles.imageWrap}>
            {voucher.imageUrl ? (
              <Image source={{ uri: voucher.imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <Text style={styles.fallbackIcon}>🎫</Text>
            )}
          </View>
          <Text style={styles.category}>{voucher.categoryTitle}</Text>
          <Text style={styles.faceValue}>{t('faceValue')}: {faceValue}</Text>
          <Text style={styles.price}>{formatMmk(voucher.unitPrice)}</Text>
          <Text style={[styles.stock, !voucher.inStock && styles.outOfStock]}>
            {voucher.inStock ? `${t('inStock')} (${voucher.stock})` : t('outOfStock')}
          </Text>

          {voucher.description ? (
            <Text style={styles.desc}>{voucher.description}</Text>
          ) : null}

          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>{t('quantity')}</Text>
            <View style={styles.qtyControls}>
              <Button
                title="−"
                variant="outline"
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              />
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Button
                title="+"
                variant="outline"
                onPress={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={!voucher.inStock}
              />
            </View>
          </View>

          <Text style={styles.total}>{t('total')}: {formatMmk(total)}</Text>

          <View style={styles.actions}>
            <Button
              title={`🛒 ${t('addToCart')}`}
              variant="secondary"
              onPress={handleAddToCart}
              disabled={!voucher.inStock}
            />
            <Button
              title={t('buyNow')}
              onPress={handleBuyNow}
              disabled={!voucher.inStock}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  imageWrap: { alignItems: 'center', marginBottom: spacing.md },
  image: { width: 120, height: 120, borderRadius: radius.md },
  fallbackIcon: { fontSize: 64 },
  category: { color: colors.darkGray, textAlign: 'center', marginBottom: 4 },
  faceValue: { color: colors.darkGray, textAlign: 'center', marginBottom: spacing.sm },
  price: {
    color: colors.cyan,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stock: { textAlign: 'center', color: colors.darkGray, marginBottom: spacing.md },
  outOfStock: { color: colors.red },
  desc: { color: colors.darkGray, fontSize: 14, marginBottom: spacing.md, lineHeight: 20 },
  qtyRow: { marginBottom: spacing.md },
  qtyLabel: { color: colors.white, fontWeight: '600', marginBottom: spacing.sm },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyValue: { color: colors.white, fontSize: 20, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  total: { color: colors.white, fontWeight: '700', fontSize: 18, marginBottom: spacing.lg },
  actions: { gap: spacing.sm },
});

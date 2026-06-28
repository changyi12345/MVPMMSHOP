import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { readCart, removeFromCart, updateCartQuantity, getCartItemCount, saveCheckoutPromo, clearCheckoutPromo } from '../lib/cart-store';
import { formatPrice } from '../data/mockData';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import Button from '../components/Button';
import MainHeader from '../components/MainHeader';
import { subscribeLang, t } from '../i18n';
import { validatePromo } from '../api/promos';

interface Props {
  onCheckout: () => void;
  refreshKey?: number;
  onNotificationsPress?: () => void;
  notificationRefreshKey?: number;
}

export default function CartScreen({
  onCheckout,
  refreshKey = 0,
  onNotificationsPress,
  notificationRefreshKey,
}: Props) {
  const [, setTick] = useState(0);
  const [, langBump] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const cartItems = readCart();
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    reload();
  }, [refreshKey, reload]);

  useEffect(() => subscribeLang(() => langBump((n) => n + 1)), []);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const result = await validatePromo(promoCode, subtotal);
      if (result.valid) {
        const code = result.code ?? promoCode.toUpperCase();
        setAppliedCode(code);
        setDiscount(result.discountAmount);
        saveCheckoutPromo(code, result.discountAmount);
        Alert.alert(t('promoApplied'));
      } else {
        Alert.alert(t('promoInvalid'));
      }
    } catch {
      Alert.alert(t('promoInvalid'));
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setAppliedCode('');
    setDiscount(0);
    clearCheckoutPromo();
  };

  return (
    <View style={screen.root}>
      <MainHeader
        onNotificationsPress={onNotificationsPress}
        notificationRefreshKey={notificationRefreshKey}
        onLangChange={() => langBump((n) => n + 1)}
      />
      <ScrollView contentContainerStyle={[screen.content, styles.scroll]}>
        {cartItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={screen.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          cartItems.map((item) => (
            <View key={item.cartKey} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.playerId ? (
                  <Text style={screen.metaText}>Player: {item.playerId}</Text>
                ) : null}
                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => { updateCartQuantity(item.cartKey, item.quantity - 1); reload(); }}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>x{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => { updateCartQuantity(item.cartKey, item.quantity + 1); reload(); }}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => { removeFromCart(item.cartKey); reload(); }}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        {cartItems.length > 0 && (
          <View style={styles.promoBox}>
            <Text style={styles.promoLabel}>{t('promoCode')}</Text>
            {appliedCode ? (
              <View style={styles.promoApplied}>
                <Text style={styles.promoAppliedText}>{appliedCode} (−{formatPrice(discount)})</Text>
                <TouchableOpacity onPress={removePromo}>
                  <Text style={styles.promoRemove}>{t('remove')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.promoRow}>
                <TextInput
                  style={styles.promoInput}
                  placeholder={t('enterPromoCode')}
                  placeholderTextColor={colors.darkGray}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.promoBtn} onPress={applyPromo}>
                  <Text style={styles.promoBtnText}>{t('apply')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      {cartItems.length > 0 && (
        <View style={screen.footer}>
          {discount > 0 ? (
            <Text style={styles.subtotal}>{t('subtotal')}: {formatPrice(subtotal)}</Text>
          ) : null}
          <Text style={styles.total}>{t('total')}: {formatPrice(total)}</Text>
          <Button title="Checkout" onPress={onCheckout} fullWidth />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  itemName: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: colors.text },
  itemPrice: { fontSize: 15, fontWeight: '700', color: colors.cyan },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.violetDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: colors.white, fontWeight: '700' },
  qty: { fontSize: 16, fontWeight: '500', minWidth: 24, textAlign: 'center', color: colors.text },
  remove: { color: colors.red, fontSize: 18, padding: 4 },
  subtotal: { fontSize: 14, color: colors.darkGray, marginBottom: 4, textAlign: 'center' },
  total: { fontSize: 20, fontWeight: '700', marginBottom: spacing.md, textAlign: 'center', color: colors.text },
  promoBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  promoLabel: { color: colors.text, fontWeight: '600', marginBottom: spacing.sm },
  promoRow: { flexDirection: 'row', gap: spacing.sm },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    backgroundColor: colors.black,
  },
  promoBtn: {
    backgroundColor: colors.violet,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    justifyContent: 'center',
  },
  promoBtnText: { color: colors.white, fontWeight: '700' },
  promoApplied: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  promoAppliedText: { color: colors.cyan, fontWeight: '600' },
  promoRemove: { color: colors.red, fontWeight: '600' },
});

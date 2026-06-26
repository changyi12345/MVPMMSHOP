import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { screen, select } from '../theme/screenStyles';
import { colors, spacing, radius } from '../theme/colors';
import { t } from '../i18n';
import { formatPrice } from '../data/mockData';
import Button from '../components/Button';
import { readCart, clearCart, readCheckoutPromo, clearCheckoutPromo } from '../lib/cart-store';
import { fetchShopSettings, resolvePaymentMethods } from '../api/settings';
import { fetchWallet } from '../api/wallet';
import {
  cartItemsToOrderPayload,
  createOrder,
  resolvePrimaryOrderId,
  submitPaymentProof,
} from '../api/orders';
import { uploadPaymentProofUri } from '../api/upload';
import { pickPaymentProofImage } from '../utils/pick-image';

interface Props {
  onBack: () => void;
  onSuccess: (orderId: number) => void;
}

export default function CheckoutScreen({ onBack, onSuccess }: Props) {
  const cartItems = readCart();
  const promo = readCheckoutPromo();
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promo?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const [payment, setPayment] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [methods, setMethods] = useState<
    { id: string; name: string; accountNumber: string; accountHolder: string }[]
  >([]);
  const [reference, setReference] = useState('');
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true);

  useEffect(() => {
    Promise.all([fetchShopSettings(), fetchWallet().catch(() => ({ balance: 0 }))])
      .then(([shop, wallet]) => {
        const external = resolvePaymentMethods(shop).map((m) => ({
          id: m.id,
          name: m.name,
          accountNumber: m.accountNumber,
          accountHolder: m.accountHolder,
        }));
        setMethods(external);
        setPayment('wallet');
        setWalletBalance(Number(wallet.balance ?? 0));
      })
      .catch(() => {
        setMethods([
          { id: 'kbz', name: 'KBZ Pay', accountNumber: '—', accountHolder: 'MVPMMSHOP' },
        ]);
      })
      .finally(() => setLoadingShop(false));
  }, []);

  const paymentOptions = [
    { id: 'wallet', name: 'Wallet Balance', accountNumber: formatPrice(walletBalance), accountHolder: '' },
    ...methods,
  ];

  const canPayWithWallet = walletBalance >= total;
  const selectedMethod = paymentOptions.find((m) => m.id === payment);

  const pickImage = async () => {
    const picked = await pickPaymentProofImage();
    if (picked) setProofUri(picked.uri);
  };

  const handleSubmit = async () => {
    if (!cartItems.length) {
      Alert.alert('Empty cart', 'Add items before checkout');
      return;
    }
    if (payment === 'wallet' && !canPayWithWallet) {
      Alert.alert('Insufficient balance', 'Top up your wallet or choose another method');
      return;
    }

    setLoading(true);
    try {
      const result = await createOrder({
        items: cartItemsToOrderPayload(cartItems),
        paymentMethod: payment,
        promoCode: promo?.code,
      });
      const orderId = resolvePrimaryOrderId(result);

      if (payment !== 'wallet') {
        let imageUrl: string | undefined;
        if (proofUri) {
          try {
            imageUrl = await uploadPaymentProofUri(proofUri);
          } catch {
            const base64 = await fetch(proofUri).then((r) => r.blob()).catch(() => null);
            if (base64) {
              // fallback skipped — reference only
            }
          }
        }
        await submitPaymentProof(orderId, {
          method: selectedMethod?.name ?? payment,
          reference: reference.trim() || undefined,
          imageUrl,
        });
      }

      clearCart();
      clearCheckoutPromo();
      onSuccess(orderId);
    } catch (err) {
      Alert.alert('Checkout failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length) {
    return (
      <View style={[screen.root, styles.center]}>
        <Text style={styles.emptyMsg}>Cart is empty</Text>
        <Button title={t('back')} onPress={onBack} />
      </View>
    );
  }

  return (
    <View style={screen.root}>
      <ScreenHeader title="Checkout" onBack={onBack} />

      {loadingShop ? (
        <ActivityIndicator color={colors.violet} style={{ marginTop: 24 }} />
      ) : (
        <ScrollView contentContainerStyle={screen.content}>
          <View style={screen.card}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cartItems.map((item) => (
              <Text key={item.cartKey} style={styles.item}>
                {item.name} x{item.quantity} — {formatPrice(item.price * item.quantity)}
              </Text>
            ))}
            {discount > 0 && (
              <Text style={styles.discount}>Promo: −{formatPrice(discount)}</Text>
            )}
            <Text style={styles.total}>Total: {formatPrice(total)}</Text>
          </View>

          <View style={screen.card}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentOptions.map((m) => {
              const disabled = m.id === 'wallet' && !canPayWithWallet;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    select.option,
                    payment === m.id && select.optionActive,
                    disabled && select.optionDisabled,
                  ]}
                  onPress={() => !disabled && setPayment(m.id)}
                >
                  <Text style={styles.paymentName}>
                    {m.name}
                    {disabled && ' (Insufficient)'}
                  </Text>
                  {m.id === 'wallet' ? (
                    <Text style={styles.paymentAccount}>Balance: {m.accountNumber}</Text>
                  ) : (
                    <>
                      <Text style={styles.paymentAccount}>{m.accountNumber}</Text>
                      {m.accountHolder ? (
                        <Text style={styles.paymentHolder}>{m.accountHolder}</Text>
                      ) : null}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
            {payment === 'wallet' && canPayWithWallet ? (
              <View style={styles.walletNote}>
                <Text style={styles.walletNoteText}>💰 {formatPrice(total)} deducted instantly</Text>
              </View>
            ) : payment !== 'wallet' ? (
              <View style={styles.warning}>
                <Text style={styles.warningText}>⚠️ Transfer exact: {formatPrice(total)}</Text>
              </View>
            ) : null}
          </View>

          {payment !== 'wallet' && (
            <>
              <View style={screen.card}>
                <Text style={styles.sectionTitle}>Payment Proof</Text>
                <TouchableOpacity style={styles.uploadZone} onPress={pickImage}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text>{proofUri ? 'Photo selected — tap to change' : 'Choose screenshot'}</Text>
                </TouchableOpacity>
              </View>
              <View style={screen.card}>
                <Text style={styles.sectionTitle}>Transaction Reference</Text>
                <TextInput
                  style={screen.input}
                  placeholder="TXN reference (optional)"
                  value={reference}
                  onChangeText={setReference}
                />
              </View>
            </>
          )}

          {loading ? (
            <ActivityIndicator color={colors.violet} />
          ) : (
            <Button
              title={payment === 'wallet' ? 'Pay with Wallet' : 'Submit Order'}
              onPress={handleSubmit}
              fullWidth
              disabled={payment === 'wallet' && !canPayWithWallet}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.black },
  emptyMsg: { color: colors.white, marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md, color: colors.white },
  item: { marginBottom: 4, color: colors.darkGray },
  discount: { color: colors.green, marginTop: spacing.sm },
  total: { fontSize: 18, fontWeight: '700', marginTop: spacing.sm, color: colors.cyan },
  paymentName: { fontWeight: '600', marginBottom: 2, color: colors.white },
  paymentAccount: { fontSize: 13, color: colors.darkGray },
  paymentHolder: { fontSize: 12, color: colors.darkGray, marginTop: 2 },
  walletNote: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  walletNoteText: { fontWeight: '600', color: colors.cyan },
  warning: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  warningText: { fontWeight: '600', color: colors.red },
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  uploadIcon: { fontSize: 40, marginBottom: spacing.sm },
});

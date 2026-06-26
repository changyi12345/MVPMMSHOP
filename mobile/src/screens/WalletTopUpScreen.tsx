import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { screen, select } from '../theme/screenStyles';
import { formatPrice } from '../data/mockData';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { requestTopUp, WALLET_TOPUP_AMOUNTS } from '../api/wallet';
import { fetchShopSettings, resolvePaymentMethods, ShopInfo } from '../api/settings';
import { getAuth } from '../api/auth';
import { t } from '../i18n';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export default function WalletTopUpScreen({ onBack, onSuccess }: Props) {
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [amount, setAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [payment, setPayment] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShopSettings()
      .then((data) => {
        setShop(data);
        const methods = resolvePaymentMethods(data);
        setPayment(methods[0]?.id ?? 'kbz');
      })
      .catch(() => {
        setShop({
          shopName: 'MVPMMSHOP',
          paymentMethods: ['KBZ Pay', 'Wave Pay', 'Bank Transfer'],
          paymentAccounts: [],
          minWalletTopup: 1000,
          contactPhone: null,
          supportTelegram: null,
        });
        setPayment('kbz');
      });
  }, []);

  const minTopup = shop?.minWalletTopup ?? 1000;
  const selectedAmount = customAmount ? Number(customAmount) : amount;
  const methods = shop ? resolvePaymentMethods(shop) : [];

  const handleSubmit = async () => {
    if (!getAuth()?.access_token) {
      Alert.alert('Login required', 'Please login first');
      return;
    }
    if (!selectedAmount || selectedAmount < minTopup) {
      Alert.alert('Invalid amount', `Minimum top-up is ${formatPrice(minTopup)}`);
      return;
    }
    const method = methods.find((m) => m.id === payment);
    if (!method) return;

    setLoading(true);
    try {
      await requestTopUp(selectedAmount, method.name, reference.trim() || undefined);
      Alert.alert(
        'Top-Up Requested',
        `${formatPrice(selectedAmount)} top-up submitted. Awaiting payment verification.`,
        [{ text: 'OK', onPress: onSuccess }],
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = WALLET_TOPUP_AMOUNTS.filter((a) => a >= minTopup);

  return (
    <View style={screen.root}>
      <ScreenHeader title={t('topUpWallet')} onBack={onBack} />

      <ScrollView contentContainerStyle={screen.content}>
        <View style={screen.card}>
          <Text style={styles.sectionTitle}>Select Amount</Text>
          <View style={styles.amountGrid}>
            {presetAmounts.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.amountBtn, !customAmount && amount === a && styles.amountBtnActive]}
                onPress={() => { setAmount(a); setCustomAmount(''); }}
              >
                <Text style={[styles.amountText, !customAmount && amount === a && styles.amountTextActive]}>
                  {formatPrice(a)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[screen.input, { marginTop: spacing.sm }]}
            placeholder={`Custom (min ${formatPrice(minTopup)})`}
            placeholderTextColor={colors.darkGray}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={setCustomAmount}
          />
        </View>

        <View style={screen.card}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {methods.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[select.option, payment === m.id && select.optionActive]}
              onPress={() => setPayment(m.id)}
            >
              <Text style={styles.paymentName}>{m.name}</Text>
              <Text style={screen.metaText}>{m.accountNumber}</Text>
              {m.accountHolder ? (
                <Text style={screen.metaText}>{m.accountHolder}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
          <View style={styles.warning}>
            <Text style={styles.warningText}>⚠️ Transfer exact: {formatPrice(selectedAmount || 0)}</Text>
          </View>
        </View>

        <View style={screen.card}>
          <Text style={styles.sectionTitle}>Transaction Reference (optional)</Text>
          <TextInput
            style={screen.input}
            placeholder="TXN reference number"
            placeholderTextColor={colors.darkGray}
            value={reference}
            onChangeText={setReference}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.violet} />
        ) : (
          <Button title="Submit Top-Up Request" fullWidth onPress={handleSubmit} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm, color: colors.white },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amountBtn: {
    width: '30%',
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  amountBtnActive: { borderColor: colors.cyan, backgroundColor: 'rgba(6,182,212,0.12)' },
  amountText: { fontSize: 12, fontWeight: '600', color: colors.darkGray },
  amountTextActive: { color: colors.cyan },
  paymentName: { fontWeight: '600', marginBottom: 4, color: colors.white },
  warning: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  warningText: { fontSize: 13, color: colors.red },
});

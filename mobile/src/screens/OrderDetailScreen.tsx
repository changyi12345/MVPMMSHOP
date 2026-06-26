import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { formatPrice } from '../data/mockData';
import { colors, spacing, radius } from '../theme/colors';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import { cancelOrder, canCancelOrder, fetchOrder, formatOrderId } from '../api/orders';
import { fetchShopSettings } from '../api/settings';
import { t } from '../i18n';

interface Props {
  orderId: string;
  onBack: () => void;
  onCancelled?: () => void;
}

export default function OrderDetailScreen({ orderId, onBack, onCancelled }: Props) {
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelEnabled, setCancelEnabled] = useState(true);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof fetchOrder>> | null>(null);

  useEffect(() => {
    fetchShopSettings()
      .then((s) => setCancelEnabled(s.featureFlags?.userOrderCancelEnabled !== false))
      .catch(() => setCancelEnabled(true));
  }, []);

  const load = () => {
    const id = parseInt(orderId, 10);
    if (!Number.isFinite(id)) {
      setLoading(false);
      return;
    }
    fetchOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const handleCancel = () => {
    if (!order) return;
    Alert.alert(t('cancelOrder'), t('cancelConfirm'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yesCancel'),
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelOrder(order.id);
            load();
            onCancelled?.();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Could not cancel');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.violet} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: colors.white }}>Order not found</Text>
        <Button title={t('back')} onPress={onBack} />
      </View>
    );
  }

  const codes = order.voucherCodes?.map((v) => v.voucherCode) ?? [];
  const showCancel =
    cancelEnabled && canCancelOrder(order.status, order.paymentMethod);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order {formatOrderId(order.id)}</Text>
        <StatusBadge status={order.status} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Item</Text>
          <Text style={styles.item}>• {order.product.name}</Text>
          {order.topUpInput ? (
            <Text style={styles.meta}>
              Player: {order.topUpInput.playerId}
              {order.topUpInput.playerName ? ` (${order.topUpInput.playerName})` : ''}
            </Text>
          ) : null}
        </View>

        {codes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Voucher Codes</Text>
            {codes.map((code, i) => (
              <View key={i} style={styles.codeBox}>
                <Text style={styles.code}>{code}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={() => Alert.alert('Copied!', code)}>
                  <Text style={styles.copyText}>📋 Copy</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={styles.item}>Method: {order.paymentMethod ?? '—'}</Text>
          <Text style={styles.total}>Amount: {formatPrice(Number(order.totalPrice))}</Text>
          <Text style={styles.meta}>Placed: {new Date(order.createdAt).toLocaleString()}</Text>
        </View>

        {showCancel && (
          <Button
            title={cancelling ? '...' : t('cancelOrder')}
            variant="outline"
            fullWidth
            onPress={handleCancel}
            disabled={cancelling}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  back: { color: colors.cyan, fontSize: 16 },
  title: { fontSize: 18, fontWeight: '600', color: colors.white, flex: 1 },
  content: { padding: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md, color: colors.white },
  item: { marginBottom: 4, fontSize: 15, color: colors.white },
  meta: { fontSize: 13, color: colors.darkGray, marginTop: 4 },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.black,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.violetLight,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  code: { fontFamily: 'monospace', fontWeight: '600', flex: 1, color: colors.white },
  copyBtn: {
    backgroundColor: colors.cyan,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  copyText: { fontWeight: '600', fontSize: 13, color: colors.black },
  total: { fontWeight: '700', marginTop: spacing.sm, fontSize: 16, color: colors.cyan },
});

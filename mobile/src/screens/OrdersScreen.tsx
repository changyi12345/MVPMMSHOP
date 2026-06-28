import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { formatPrice } from '../data/mockData';
import { colors, spacing, radius } from '../theme/colors';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import { fetchMyOrders, formatOrderId, submitPaymentProof, cancelOrder, canCancelOrder } from '../api/orders';
import { uploadPaymentProof } from '../api/upload';
import { PickedImage } from '../utils/pick-image';
import PaymentProofPicker from '../components/PaymentProofPicker';
import { screen } from '../theme/screenStyles';
import MainHeader from '../components/MainHeader';
import { subscribeLang, t } from '../i18n';

interface Props {
  onOrderPress: (id: string) => void;
  onNotificationsPress?: () => void;
  notificationRefreshKey?: number;
}

interface OrderRow {
  id: string;
  numericId: number;
  date: string;
  status: string;
  total: number;
  items: string[];
  paymentMethod: string | null;
}

export default function OrdersScreen({
  onOrderPress,
  onNotificationsPress,
  notificationRefreshKey,
}: Props) {
  const [orderList, setOrderList] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOrder, setUploadOrder] = useState<OrderRow | null>(null);
  const [reference, setReference] = useState('');
  const [proof, setProof] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [, langBump] = useState(0);
  React.useEffect(() => subscribeLang(() => langBump((n) => n + 1)), []);

  const load = () => {
    setLoading(true);
    fetchMyOrders()
      .then((data) =>
        setOrderList(
          data.map((o) => ({
            id: formatOrderId(o.id),
            numericId: o.id,
            date: o.createdAt.slice(0, 10),
            status: o.status,
            total: Number(o.totalPrice),
            items: [o.product.name],
            paymentMethod: o.paymentMethod,
          })),
        ),
      )
      .catch((err) => {
        Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load orders');
        setOrderList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmitProof = async () => {
    if (!uploadOrder) return;
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (proof) {
        try {
          imageUrl = await uploadPaymentProof(proof);
        } catch (uploadErr) {
          Alert.alert(
            t('uploadProofFailed'),
            uploadErr instanceof Error ? uploadErr.message : t('requestFailed'),
          );
          return;
        }
      }
      await submitPaymentProof(uploadOrder.numericId, {
        method: uploadOrder.paymentMethod ?? 'manual',
        reference: reference.trim() || undefined,
        imageUrl,
      });
      setUploadOrder(null);
      setReference('');
      setProof(null);
      load();
      Alert.alert('Success', 'Payment proof submitted! Awaiting verification.');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (order: OrderRow) => {
    Alert.alert(t('cancelOrder'), t('cancelConfirm'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yesCancel'),
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(order.numericId);
            load();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Could not cancel order');
          }
        },
      },
    ]);
  };

  return (
    <View style={screen.root}>
      <MainHeader
        onNotificationsPress={onNotificationsPress}
        notificationRefreshKey={notificationRefreshKey}
        onLangChange={() => langBump((n) => n + 1)}
      />
      {loading ? (
        <ActivityIndicator color={colors.violet} style={{ marginTop: 24 }} />
      ) : (
        <ScrollView contentContainerStyle={screen.content}>
          {orderList.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>{t('noOrders')}</Text>
            </View>
          ) : (
            orderList.map((order) => (
              <TouchableOpacity key={order.id} style={[screen.card, styles.card]} onPress={() => onOrderPress(String(order.numericId))}>
                <View style={styles.row}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <StatusBadge status={order.status} />
                </View>
                <Text style={styles.date}>{order.date}</Text>
                <Text style={styles.items}>{order.items.join(', ')}</Text>
                <View style={styles.row}>
                  <Text style={styles.total}>{formatPrice(order.total)}</Text>
                  <View style={styles.actions}>
                    {order.status === 'PENDING' && order.paymentMethod !== 'wallet' && (
                      <Button
                        title={t('uploadProof')}
                        variant="outline"
                        onPress={() => {
                          setUploadOrder(order);
                          setReference('');
                          setProof(null);
                        }}
                      />
                    )}
                    {canCancelOrder(order.status, order.paymentMethod) && (
                      <Button title={t('cancelOrder')} variant="outline" onPress={() => handleCancel(order)} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={!!uploadOrder} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Payment Proof — {uploadOrder?.id}</Text>
            <PaymentProofPicker value={proof} onChange={setProof} uploading={submitting} />
            <TextInput
              style={screen.input}
              placeholder="Transaction reference"
              placeholderTextColor={colors.darkGray}
              value={reference}
              onChangeText={setReference}
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setUploadOrder(null)} />
              <Button title={submitting ? '...' : 'Submit'} onPress={handleSubmitProof} disabled={submitting} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  orderId: { fontSize: 16, fontWeight: '700', color: colors.text },
  date: { color: colors.darkGray, fontSize: 13, marginVertical: 4 },
  items: { marginBottom: 8, color: colors.text },
  total: { fontWeight: '700', color: colors.cyan },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.darkGray, marginTop: spacing.sm },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md, color: colors.text },
  modalActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.md },
});

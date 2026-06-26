import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import { formatPrice } from '../data/mockData';
import Button from '../components/Button';
import NetworkErrorView from '../components/NetworkErrorView';
import ScreenHeader from '../components/ScreenHeader';
import { fetchWallet, WalletData } from '../api/wallet';
import { getAuth } from '../api/auth';
import { useApiLoad } from '../hooks/useApiLoad';
import { t, tStatus } from '../i18n';

interface Props {
  onBack: () => void;
  onTopUp: () => void;
}

function statusColor(status: string) {
  if (status === 'COMPLETED') return colors.green;
  if (status === 'PENDING') return colors.violetLight;
  return colors.red;
}

export default function WalletScreen({ onBack, onTopUp }: Props) {
  const loader = useCallback(async () => {
    if (!getAuth()?.access_token) {
      throw new Error('Please log in to view your wallet');
    }
    return fetchWallet();
  }, []);

  const { data, loading, error, reload } = useApiLoad(loader, null as WalletData | null);

  const balance = data?.balance ?? 0;
  const transactions = data?.transactions ?? [];
  const needsLogin = !getAuth()?.access_token;

  return (
    <View style={screen.root}>
      <ScreenHeader title={`💰 ${t('wallet')}`} onBack={onBack} />

      <ScrollView contentContainerStyle={screen.content}>
        <View style={screen.heroCard}>
          <Text style={screen.label}>{t('availableBalance')}</Text>
          {loading ? (
            <ActivityIndicator color={colors.cyan} style={{ marginVertical: spacing.md }} />
          ) : error && !data ? (
            <NetworkErrorView message={error} onRetry={needsLogin ? undefined : reload} compact />
          ) : (
            <Text style={screen.priceLarge}>{formatPrice(balance)}</Text>
          )}
          {!needsLogin && (
            <View style={{ marginTop: spacing.md, width: '100%' }}>
              <Button title={t('topUpWallet')} variant="secondary" onPress={onTopUp} fullWidth />
            </View>
          )}
        </View>

        {!error && (
          <>
            <Text style={screen.sectionTitle}>{t('transactionHistory')}</Text>
            {transactions.length === 0 && !loading ? (
              <Text style={screen.emptyText}>{t('noTransactions')}</Text>
            ) : (
              transactions.map((txn) => (
                <View key={txn.id} style={screen.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txnDesc}>{txn.description ?? 'Transaction'}</Text>
                    <Text style={screen.metaText}>{txn.createdAt.slice(0, 10)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txnAmount, { color: txn.type === 'spend' ? colors.red : colors.green }]}>
                      {txn.type === 'spend' ? '-' : '+'}{formatPrice(txn.amount)}
                    </Text>
                    <Text style={[styles.txnStatus, { color: statusColor(txn.status) }]}>
                      {tStatus(txn.status)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  txnDesc: { color: colors.white, fontSize: 14, fontWeight: '600' },
  txnAmount: { fontSize: 15, fontWeight: '700' },
  txnStatus: { fontSize: 11, marginTop: 2 },
});

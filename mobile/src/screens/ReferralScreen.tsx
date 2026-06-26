import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import { formatPrice } from '../data/mockData';
import ScreenHeader from '../components/ScreenHeader';
import { fetchReferralStats } from '../api/user';
import { getAuth } from '../api/auth';
import { t } from '../i18n';

interface Props {
  onBack: () => void;
}

export default function ReferralScreen({ onBack }: Props) {
  const [stats, setStats] = useState({
    code: 'MVPMM-XXXX',
    referralCount: 0,
    totalEarnings: 0,
    rewardPerReferral: 5000,
    history: [] as { username: string; date: string; reward: number }[],
  });

  useEffect(() => {
    if (!getAuth()?.access_token) return;
    fetchReferralStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const copyCode = () => Alert.alert('Copied!', 'Referral code copied');

  return (
    <View style={screen.root}>
      <ScreenHeader title={`🎁 ${t('referralProgram')}`} onBack={onBack} />
      <ScrollView contentContainerStyle={screen.content}>
        <View style={screen.card}>
          <Text style={styles.label}>Your Referral Code</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>{stats.code}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
              <Text style={styles.copyText}>📋 Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={screen.metaText}>
            Earn {formatPrice(stats.rewardPerReferral)} per referral
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={screen.metaText}>{t('referrals')}</Text>
            <Text style={styles.statValue}>{stats.referralCount}</Text>
          </View>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={screen.metaText}>{t('earnings')}</Text>
            <Text style={[styles.statValue, { color: colors.cyan }]}>
              {formatPrice(stats.totalEarnings)}
            </Text>
          </View>
        </View>

        <View style={screen.card}>
          <Text style={styles.sectionTitle}>History</Text>
          {stats.history.length === 0 ? (
            <Text style={screen.emptyText}>No referrals yet</Text>
          ) : (
            stats.history.map((r, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyUser}>{r.username}</Text>
                <Text style={styles.reward}>+{formatPrice(r.reward)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginBottom: spacing.sm, color: colors.white },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  code: { flex: 1, fontFamily: 'monospace', fontWeight: '700', fontSize: 16, color: colors.cyan },
  copyBtn: {
    backgroundColor: colors.violet,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  copyText: { fontWeight: '600', fontSize: 13, color: colors.white },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  statValue: { fontSize: 22, fontWeight: '700', marginTop: 4, color: colors.violetLight },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md, color: colors.white },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  historyUser: { color: colors.white },
  reward: { color: colors.green, fontWeight: '600' },
});

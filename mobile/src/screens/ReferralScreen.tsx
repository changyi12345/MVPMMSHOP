import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import { formatPrice } from '../data/mockData';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { fetchReferralStats } from '../api/user';
import { getAuth } from '../api/auth';
import { t } from '../i18n';

const SHOP_URL = 'https://rankage.shop';

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

  const registerUrl = `${SHOP_URL}/auth/register?ref=${encodeURIComponent(stats.code)}`;

  const copyCode = async () => {
    try {
      await Share.share({ message: stats.code, title: t('yourReferralCode') });
    } catch {
      Alert.alert(t('yourReferralCode'), stats.code);
    }
  };

  const shareReferral = async () => {
    try {
      await Share.share({
        message: `${t('shareReferralMessage')} ${stats.code}\n${registerUrl}`,
        url: registerUrl,
        title: t('referEarn'),
      });
    } catch {
      /* cancelled */
    }
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`${t('shareReferralMessage')} ${stats.code}`);
    const url = `https://t.me/share/url?url=${encodeURIComponent(registerUrl)}&text=${text}`;
    Linking.openURL(url).catch(() => Alert.alert(t('requestFailed')));
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(registerUrl)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('requestFailed')));
  };

  return (
    <View style={screen.root}>
      <ScreenHeader title={`🎁 ${t('referralProgram')}`} onBack={onBack} />
      <ScrollView contentContainerStyle={screen.content}>
        <View style={screen.card}>
          <Text style={styles.label}>{t('yourReferralCode')}</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>{stats.code}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
              <Text style={styles.copyText}>📋 {t('copy')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={screen.metaText}>
            {t('referEarnDesc')} · {formatPrice(stats.rewardPerReferral)}
          </Text>
          <View style={styles.shareRow}>
            <Button title={t('shareTelegram')} variant="blue" small onPress={shareTelegram} />
            <Button title={t('shareFacebook')} variant="blue" small onPress={shareFacebook} />
            <Button title={t('shareReferral')} variant="outline" small onPress={shareReferral} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={screen.metaText}>{t('referrals')}</Text>
            <Text style={styles.statValue}>{stats.referralCount}</Text>
          </View>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={screen.metaText}>{t('earnings')}</Text>
            <Text style={[styles.statValue, { color: colors.cyanDark }]}>
              {formatPrice(stats.totalEarnings)}
            </Text>
          </View>
        </View>

        <View style={screen.card}>
          <Text style={styles.sectionTitle}>{t('referralHistory')}</Text>
          {stats.history.length === 0 ? (
            <Text style={screen.emptyText}>{t('noReferralsYet')}</Text>
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
  label: { fontWeight: '600', marginBottom: spacing.sm, color: colors.text },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  code: { flex: 1, fontFamily: 'monospace', fontWeight: '700', fontSize: 16, color: colors.violet },
  copyBtn: {
    backgroundColor: colors.violet,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  copyText: { fontWeight: '600', fontSize: 13, color: colors.white },
  shareRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '700', marginTop: 4, color: colors.violet },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md, color: colors.text },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyUser: { color: colors.text },
  reward: { color: colors.green, fontWeight: '600' },
});

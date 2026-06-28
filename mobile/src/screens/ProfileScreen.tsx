import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { formatPrice } from '../data/mockData';
import Button from '../components/Button';
import MainHeader from '../components/MainHeader';
import { fetchProfile, fetchReferralStats, UserProfile } from '../api/user';
import { fetchShopSettings } from '../api/settings';
import { sendProfileOtp, verifyProfileOtp } from '../api/phone';
import { getAuth, saveAuth } from '../api/auth';
import { t, subscribeLang } from '../i18n';

interface Props {
  onLogout: () => void;
  onWalletPress: () => void;
  onReferralPress?: () => void;
  onOrdersPress?: () => void;
  onLegalPress?: (slug: string, title: string) => void;
  onChangePasswordPress?: () => void;
  onEventsPress?: () => void;
  onNotificationsPress?: () => void;
  notificationRefreshKey?: number;
}

export default function ProfileScreen({
  onLogout,
  onWalletPress,
  onReferralPress,
  onOrdersPress,
  onLegalPress,
  onChangePasswordPress,
  onEventsPress,
  onNotificationsPress,
  notificationRefreshKey,
}: Props) {
  const [, langBump] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [referrals, setReferrals] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => subscribeLang(() => langBump((n) => n + 1)), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, shop] = await Promise.all([
        fetchProfile(),
        fetchShopSettings().catch(() => null),
      ]);
      setProfile(p);
      setPhone(p.phone ?? '');
      setSmsEnabled(!!shop?.featureFlags?.smsOtpEnabled);
      saveAuth({ access_token: getAuth()!.access_token, user: { ...getAuth()!.user, ...p } });
      try {
        const ref = await fetchReferralStats();
        setReferrals(ref.referralCount);
        setEarnings(ref.totalEarnings);
      } catch {
        setReferrals(0);
        setEarnings(0);
      }
    } catch {
      const cached = getAuth()?.user;
      if (cached) setProfile(cached as UserProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    setVerifying(true);
    try {
      await sendProfileOtp(phone.trim());
      setOtpSent(true);
      Alert.alert('OK', 'Verification code sent');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerify = async () => {
    if (!phone.trim() || !otpCode.trim()) return;
    setVerifying(true);
    try {
      await verifyProfileOtp(phone.trim(), otpCode.trim());
      await load();
      Alert.alert('OK', t('phoneVerified'));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setVerifying(false);
    }
  };

  const menuItems = [
    { icon: '💰', label: t('myWallet'), onPress: onWalletPress },
    { icon: '🎁', label: t('referralProgram'), onPress: onReferralPress },
    { icon: '📦', label: t('myOrders'), onPress: onOrdersPress },
    { icon: '🔔', label: t('notifications'), onPress: onNotificationsPress },
    ...(onChangePasswordPress ? [{ icon: '🔒', label: t('changePassword'), onPress: onChangePasswordPress }] : []),
    ...(onEventsPress ? [{ icon: '📰', label: t('eventsNews'), onPress: onEventsPress }] : []),
    ...(onLegalPress ? [{ icon: '❓', label: t('helpFaq'), onPress: () => onLegalPress('faq', t('helpFaq')) }] : []),
    ...(onLegalPress ? [{ icon: '📞', label: t('contactSupport'), onPress: () => onLegalPress('help', t('contactSupport')) }] : []),
    ...(onLegalPress ? [{ icon: '📄', label: t('termsOfService'), onPress: () => onLegalPress('terms', t('termsOfService')) }] : []),
    ...(onLegalPress ? [{ icon: '🔒', label: t('privacyPolicy'), onPress: () => onLegalPress('privacy', t('privacyPolicy')) }] : []),
  ];

  const balance = profile?.walletBalance ?? getAuth()?.user.walletBalance ?? 0;

  return (
    <View style={styles.container}>
      <MainHeader
        onNotificationsPress={onNotificationsPress}
        notificationRefreshKey={notificationRefreshKey}
        onLangChange={() => langBump((n) => n + 1)}
      />
      {loading && !profile ? (
        <ActivityIndicator color={colors.violet} style={{ marginTop: 24 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            <Text style={styles.avatar}>👤</Text>
            <Text style={styles.name}>{profile?.username ?? '—'}</Text>
            <Text style={styles.email}>{profile?.email ?? '—'}</Text>
          </View>

          <TouchableOpacity style={styles.walletCard} onPress={onWalletPress}>
            <Text style={styles.walletLabel}>{t('availableBalance')}</Text>
            <Text style={styles.walletValue}>{formatPrice(balance)}</Text>
            <Text style={styles.walletLink}>{t('myWallet')} →</Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{referrals}</Text>
              <Text style={styles.statLabel}>{t('referrals')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.cyan }]}>{formatPrice(earnings)}</Text>
              <Text style={styles.statLabel}>{t('earnings')}</Text>
            </View>
          </View>

          {smsEnabled && (
            <View style={styles.phoneCard}>
              <Text style={styles.phoneTitle}>📱 {t('phoneVerify')}</Text>
              <Text style={styles.phoneStatus}>
                {profile?.phoneVerified ? `✓ ${t('phoneVerified')}` : t('phoneNotVerified')}
              </Text>
              {!profile?.phoneVerified && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder={t('phoneNumber')}
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.darkGray}
                    value={phone}
                    onChangeText={setPhone}
                  />
                  <View style={styles.otpActions}>
                    <Button title={t('sendCode')} variant="outline" small onPress={handleSendOtp} disabled={verifying} />
                    {otpSent && (
                      <>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder={t('otpCode')}
                          keyboardType="number-pad"
                          placeholderTextColor={colors.darkGray}
                          value={otpCode}
                          onChangeText={setOtpCode}
                          maxLength={6}
                        />
                        <Button title={t('verifyCode')} small onPress={handleVerify} disabled={verifying} />
                      </>
                    )}
                  </View>
                </>
              )}
            </View>
          )}

          <View style={styles.menuCard}>
            {menuItems.filter((item) => item.onPress).map((item) => (
              <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
                <Text style={styles.menuText}>{item.icon} {item.label}</Text>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title={`🚪 ${t('logout')}`} variant="outline" fullWidth onPress={onLogout} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { fontSize: 64, marginBottom: spacing.sm },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  email: { color: colors.textMuted, marginTop: 4 },
  walletCard: {
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.violetDark,
  },
  walletLabel: { color: colors.white, opacity: 0.85, fontSize: 14 },
  walletValue: { fontSize: 28, fontWeight: '700', color: colors.white, marginVertical: spacing.sm },
  walletLink: { color: colors.cyan, fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.violet },
  statLabel: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  phoneCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  phoneTitle: { color: colors.text, fontWeight: '700', marginBottom: 4 },
  phoneStatus: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.sm,
  },
  otpActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  menuText: { fontSize: 16, color: colors.text },
  arrow: { color: colors.darkGray },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import Button from '../components/Button';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { registerUser, loginWithGoogle, saveAuth } from '../api/auth';
import { GOOGLE_WEB_CLIENT_ID } from '../config/google';
import { fetchShopSettings } from '../api/settings';
import { sendRegisterOtp } from '../api/phone';
import { t } from '../i18n';

function ensureGoogleConfigured() {
  if (!GOOGLE_WEB_CLIENT_ID) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: false });
}

interface Props {
  onSuccess: () => void;
  onLoginPress: () => void;
}

export default function RegisterScreen({ onSuccess, onLoginPress }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [smsRequired, setSmsRequired] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShopSettings()
      .then((s) => setSmsRequired(!!s.featureFlags?.smsOtpEnabled))
      .catch(() => setSmsRequired(false));
  }, []);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError('Enter phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendRegisterOtp(phone.trim());
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      setError('Google sign-in is not configured');
      return;
    }
    setError('');
    setLoading(true);
    try {
      ensureGoogleConfigured();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (response.type !== 'success' || !response.data?.idToken) {
        throw new Error('Google sign-in cancelled');
      }
      const result = await loginWithGoogle({
        idToken: response.data.idToken,
        referralCode: referralCode.trim() || undefined,
      });
      saveAuth(result);
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (smsRequired && (!phone.trim() || !otpCode.trim())) {
      setError(t('smsRequired'));
      return;
    }
    setLoading(true);
    try {
      const result = await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
        ...(smsRequired ? { phone: phone.trim(), otpCode: otpCode.trim() } : phone.trim() ? { phone: phone.trim() } : {}),
      });
      saveAuth(result);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>MVPMMSHOP</Text>
        <Text style={styles.title}>{t('registerTitle')}</Text>

        <View style={styles.form}>
          <Text style={styles.label}>{t('username')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('username')}
            placeholderTextColor={colors.darkGray}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t('email')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('email')}
            keyboardType="email-address"
            placeholderTextColor={colors.darkGray}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t('password')}</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            secureTextEntry
            placeholderTextColor={colors.darkGray}
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>{t('phoneNumber')}{smsRequired ? ' *' : ''}</Text>
          <View style={styles.otpRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="09xxxxxxxxx"
              keyboardType="phone-pad"
              placeholderTextColor={colors.darkGray}
              value={phone}
              onChangeText={setPhone}
            />
            {smsRequired && (
              <Button title={t('sendCode')} variant="blue" small onPress={handleSendOtp} disabled={loading} />
            )}
          </View>
          {smsRequired && otpSent && (
            <>
              <Text style={styles.label}>{t('otpCode')}</Text>
              <TextInput
                style={styles.input}
                placeholder="6-digit code"
                keyboardType="number-pad"
                placeholderTextColor={colors.darkGray}
                value={otpCode}
                onChangeText={setOtpCode}
                maxLength={6}
              />
            </>
          )}

          <Text style={styles.label}>{t('referralCode')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('referralCode')}
            placeholderTextColor={colors.darkGray}
            value={referralCode}
            onChangeText={setReferralCode}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color={colors.violet} style={{ marginTop: spacing.md }} />
          ) : (
            <>
              <Button title={t('register')} onPress={handleSubmit} fullWidth />
              {GOOGLE_WEB_CLIENT_ID ? (
                <View style={{ marginTop: spacing.md }}>
                  <Button title={t('continueGoogle')} variant="outline" onPress={handleGoogle} fullWidth />
                </View>
              ) : null}
            </>
          )}
        </View>

        <Text style={styles.switch}>
          {t('alreadyHaveAccount')}{' '}
          <Text style={styles.switchLink} onPress={onLoginPress}>
            {t('login')}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.violetLight,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  label: { fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, marginTop: spacing.sm, color: colors.white },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 44,
    color: colors.white,
    backgroundColor: colors.black,
  },
  otpRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  error: { color: colors.red, fontSize: 13, marginTop: spacing.sm },
  switch: { textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: spacing.lg },
  switchLink: { color: colors.cyan, fontWeight: '600' },
});

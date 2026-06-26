import React, { useState } from 'react';
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
import { loginUser, loginWithGoogle, saveAuth } from '../api/auth';
import { GOOGLE_WEB_CLIENT_ID } from '../config/google';
import { t } from '../i18n';

function ensureGoogleConfigured() {
  if (!GOOGLE_WEB_CLIENT_ID) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: false });
}

interface Props {
  onLogin: () => void;
  onRegisterPress: () => void;
  onForgotPassword?: () => void;
  onBrowseGuest?: () => void;
}

export default function LoginScreen({ onLogin, onRegisterPress, onForgotPassword, onBrowseGuest }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const result = await loginWithGoogle({ idToken: response.data.idToken });
      saveAuth(result);
      onLogin();
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
    setLoading(true);
    try {
      const result = await loginUser({ username: username.trim(), password });
      saveAuth(result);
      onLogin();
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
        <Text style={styles.title}>{t('loginTitle')}</Text>

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

          <Text style={styles.label}>{t('password')}</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            secureTextEntry
            placeholderTextColor={colors.darkGray}
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {onForgotPassword ? (
            <TouchableOpacity onPress={onForgotPassword} style={styles.forgotWrap}>
              <Text style={styles.forgotLink}>{t('forgotPassword')}</Text>
            </TouchableOpacity>
          ) : null}

          {loading ? (
            <ActivityIndicator color={colors.violet} style={{ marginTop: spacing.md }} />
          ) : (
            <>
              <Button title={t('login')} onPress={handleSubmit} fullWidth />
              {GOOGLE_WEB_CLIENT_ID ? (
                <View style={{ marginTop: spacing.md }}>
                  <Button title={t('continueGoogle')} variant="outline" onPress={handleGoogle} fullWidth />
                </View>
              ) : null}
            </>
          )}
        </View>

        <Text style={styles.switch}>
          {t('noAccount')}{' '}
          <Text style={styles.switchLink} onPress={onRegisterPress}>
            {t('register')}
          </Text>
        </Text>
        {onBrowseGuest ? (
          <TouchableOpacity onPress={onBrowseGuest} style={styles.guestWrap}>
            <Text style={styles.guestLink}>{t('browseAsGuest')}</Text>
          </TouchableOpacity>
        ) : null}
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
  error: { color: colors.red, fontSize: 13, marginTop: spacing.sm },
  forgotWrap: { alignSelf: 'flex-end', marginTop: spacing.sm },
  forgotLink: { color: colors.cyan, fontSize: 13, fontWeight: '600' },
  switch: { textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: spacing.lg },
  switchLink: { color: colors.cyan, fontWeight: '600' },
  guestWrap: { marginTop: spacing.md, alignItems: 'center' },
  guestLink: { color: colors.darkGray, fontSize: 14, textDecorationLine: 'underline' },
});

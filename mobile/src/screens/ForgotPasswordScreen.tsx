import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import { forgotPassword } from '../api/password';
import { t } from '../i18n';

interface Props {
  onBack: () => void;
}

export default function ForgotPasswordScreen({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) {
      setError(t('emailRequired'));
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={screen.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={t('forgotPassword')} onBack={onBack} />
      <ScrollView contentContainerStyle={[screen.content, styles.scroll]}>
        {sent ? (
          <View style={styles.card}>
            <Text style={styles.successTitle}>{t('resetEmailSent')}</Text>
            <Text style={styles.successBody}>{t('resetEmailHint')}</Text>
            <Button title={t('backToLogin')} onPress={onBack} fullWidth />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.hint}>{t('forgotPasswordHint')}</Text>
            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('email')}
              placeholderTextColor={colors.darkGray}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading ? (
              <ActivityIndicator color={colors.violet} style={{ marginTop: spacing.md }} />
            ) : (
              <Button title={t('sendResetLink')} onPress={handleSubmit} fullWidth />
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  hint: { color: colors.darkGray, marginBottom: spacing.md, lineHeight: 20 },
  label: { color: colors.white, fontWeight: '500', marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.white,
    backgroundColor: colors.black,
    marginBottom: spacing.sm,
  },
  error: { color: colors.red, marginBottom: spacing.sm },
  successTitle: { color: colors.white, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  successBody: { color: colors.darkGray, marginBottom: spacing.lg, lineHeight: 20 },
});

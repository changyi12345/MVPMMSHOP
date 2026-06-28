import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import { changePassword } from '../api/user';
import { t } from '../i18n';

interface Props {
  onBack: () => void;
  onSuccess?: () => void;
}

export default function ChangePasswordScreen({ onBack, onSuccess }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (newPassword.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert(t('passwordChanged'), t('passwordChangedHint'), [
        { text: 'OK', onPress: () => (onSuccess ? onSuccess() : onBack()) },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={screen.root}>
      <ScreenHeader title={t('changePassword')} onBack={onBack} />
      <ScrollView contentContainerStyle={screen.content}>
        <View style={screen.card}>
          <Text style={styles.hint}>{t('updatePassword')}</Text>

          <Text style={screen.labelLight}>{t('currentPassword')}</Text>
          <TextInput
            style={screen.input}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={screen.labelLight}>{t('newPassword')}</Text>
          <TextInput
            style={screen.input}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={screen.labelLight}>{t('confirmPassword')}</Text>
          <TextInput
            style={screen.input}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor={colors.textMuted}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color={colors.violet} style={{ marginTop: spacing.md }} />
          ) : (
            <Button title={t('changePassword')} onPress={handleSubmit} fullWidth />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  error: { color: colors.red, marginBottom: spacing.sm },
});

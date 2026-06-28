import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import MainHeader from '../components/MainHeader';
import Button from '../components/Button';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import { t } from '../i18n';

interface Props {
  onLogin: () => void;
  onRegister: () => void;
  onLegalPress: (slug: string, title: string) => void;
  onEventsPress: () => void;
}

const LEGAL_LINKS = [
  { slug: 'faq', titleKey: 'helpFaq' },
  { slug: 'help', titleKey: 'contactSupport' },
  { slug: 'terms', titleKey: 'termsOfService' },
  { slug: 'privacy', titleKey: 'privacyPolicy' },
] as const;

export default function GuestProfileScreen({
  onLogin,
  onRegister,
  onLegalPress,
  onEventsPress,
}: Props) {
  return (
    <View style={screen.root}>
      <MainHeader />
      <ScrollView contentContainerStyle={[screen.content, styles.scroll]}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{t('guestWelcome')}</Text>
          <Text style={styles.heroSub}>{t('guestWelcomeSub')}</Text>
          <Button title={t('login')} onPress={onLogin} fullWidth />
          <View style={{ height: spacing.sm }} />
          <Button title={t('register')} variant="outline" onPress={onRegister} fullWidth />
        </View>

        <TouchableOpacity style={styles.linkRow} onPress={onEventsPress}>
          <Text style={styles.linkText}>📰 {t('eventsNews')}</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        {LEGAL_LINKS.map((link) => (
          <TouchableOpacity
            key={link.slug}
            style={styles.linkRow}
            onPress={() => onLegalPress(link.slug, t(link.titleKey))}
          >
            <Text style={styles.linkText}>{t(link.titleKey)}</Text>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderBrand,
  },
  heroTitle: { color: colors.textTitle, fontSize: 20, fontWeight: '700', marginBottom: spacing.sm },
  heroSub: { color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkText: { color: colors.text, fontSize: 15, fontWeight: '500' },
  chevron: { color: colors.cyanDark, fontSize: 16 },
});

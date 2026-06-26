import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import NetworkErrorView from '../components/NetworkErrorView';
import { fetchLegalPage } from '../api/content';
import { colors, spacing } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import { t } from '../i18n';

interface Props {
  slug: string;
  title: string;
  onBack: () => void;
}

export default function LegalScreen({ slug, title, onBack }: Props) {
  const [sections, setSections] = useState<{ title: string; body: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchLegalPage(slug)
      .then((page) => setSections(page.sections))
      .catch((err) => setError(err instanceof Error ? err.message : t('requestFailed')))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <View style={screen.root}>
      <ScreenHeader title={title} onBack={onBack} />
      {loading ? (
        <ActivityIndicator color={colors.violet} style={{ marginTop: spacing.xl }} />
      ) : error ? (
        <NetworkErrorView message={error} onRetry={() => {
          setError('');
          setLoading(true);
          fetchLegalPage(slug)
            .then((page) => setSections(page.sections))
            .catch((err) => setError(err instanceof Error ? err.message : t('requestFailed')))
            .finally(() => setLoading(false));
        }} />
      ) : (
        <ScrollView contentContainerStyle={[screen.content, styles.scroll]}>
          {sections.length === 0 ? (
            <Text style={screen.emptyText}>{t('noContentYet')}</Text>
          ) : (
            sections.map((s, i) => (
              <React.Fragment key={`${s.title}-${i}`}>
                <Text style={styles.sectionTitle}>{s.title}</Text>
                <Text style={styles.sectionBody}>{s.body}</Text>
              </React.Fragment>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  sectionTitle: { color: colors.white, fontSize: 17, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.md },
  sectionBody: { color: colors.darkGray, lineHeight: 22 },
});

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, ActivityIndicator, Image, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import NetworkErrorView from '../components/NetworkErrorView';
import { fetchEvent } from '../api/content';
import { colors, spacing } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import { t } from '../i18n';

interface Props {
  slug: string;
  onBack: () => void;
}

export default function EventDetailScreen({ slug, onBack }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchEvent(slug)
      .then((e) => {
        setTitle(e.title);
        setBody(e.content ?? e.excerpt ?? '');
        setImageUrl(e.imageUrl);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t('requestFailed')))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <View style={screen.root}>
      <ScreenHeader title={title || t('eventsNews')} onBack={onBack} />
      {loading ? (
        <ActivityIndicator color={colors.violet} style={{ marginTop: spacing.xl }} />
      ) : error ? (
        <NetworkErrorView message={error} onRetry={() => {
          setLoading(true);
          fetchEvent(slug)
            .then((e) => {
              setTitle(e.title);
              setBody(e.content ?? e.excerpt ?? '');
              setImageUrl(e.imageUrl);
            })
            .catch((err) => setError(err instanceof Error ? err.message : t('requestFailed')))
            .finally(() => setLoading(false));
        }} />
      ) : (
        <ScrollView contentContainerStyle={[screen.content, styles.scroll]}>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : null}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  image: { width: '100%', height: 180, borderRadius: 8, marginBottom: spacing.md },
  title: { color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  body: { color: colors.darkGray, lineHeight: 24, fontSize: 15 },
});

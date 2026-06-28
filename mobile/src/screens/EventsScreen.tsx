import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import NetworkErrorView from '../components/NetworkErrorView';
import { fetchEvents, ShopEvent } from '../api/content';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import { t } from '../i18n';

interface Props {
  onBack: () => void;
  onEventPress: (slug: string) => void;
}

export default function EventsScreen({ onBack, onEventPress }: Props) {
  const [events, setEvents] = useState<ShopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchEvents()
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : t('requestFailed')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={screen.root}>
      <ScreenHeader title={t('eventsNews')} onBack={onBack} />
      {loading ? (
        <ActivityIndicator color={colors.violet} style={{ marginTop: spacing.xl }} />
      ) : error ? (
        <NetworkErrorView message={error} onRetry={load} />
      ) : (
        <ScrollView contentContainerStyle={[screen.content, styles.scroll]}>
          {events.length === 0 ? (
            <Text style={screen.emptyText}>{t('noEventsYet')}</Text>
          ) : (
            events.map((e) => (
              <TouchableOpacity key={e.id} style={styles.card} onPress={() => onEventPress(e.slug)}>
                {e.imageUrl ? (
                  <Image source={{ uri: e.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : null}
                <View style={styles.cardBody}>
                  <Text style={styles.title}>{e.title}</Text>
                  {e.excerpt ? <Text style={styles.excerpt} numberOfLines={2}>{e.excerpt}</Text> : null}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  image: { width: '100%', height: 140 },
  cardBody: { padding: spacing.md },
  title: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  excerpt: { color: colors.darkGray, lineHeight: 20 },
});

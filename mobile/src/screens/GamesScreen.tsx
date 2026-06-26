import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ApiGame, fetchGames } from '../data/mockData';
import { groupGamesForDisplay } from '../utils/groupGames';
import { matchesGamePlatformFilter, type GamePlatformFilter } from '../utils/gamePlatform';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import GameCard from '../components/GameCard';
import NetworkErrorView from '../components/NetworkErrorView';
import AppHeader from '../components/AppHeader';
import { useApiLoad } from '../hooks/useApiLoad';
import { subscribeLang, t } from '../i18n';

interface Props {
  onGamePress: (slug: string, imageUrl?: string | null) => void;
  onNotificationsPress?: () => void;
  notificationRefreshKey?: number;
}

const PLATFORM_CHIPS: { id: GamePlatformFilter; labelKey: 'filterAll' | 'filterMobileGames' | 'filterPcGames' }[] = [
  { id: 'all', labelKey: 'filterAll' },
  { id: 'mobile', labelKey: 'filterMobileGames' },
  { id: 'pc', labelKey: 'filterPcGames' },
];

export default function GamesScreen({
  onGamePress,
  onNotificationsPress,
  notificationRefreshKey,
}: Props) {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<GamePlatformFilter>('all');
  const [, langBump] = useState(0);
  useEffect(() => subscribeLang(() => langBump((n) => n + 1)), []);

  const loader = useCallback(
    () => fetchGames().then((data) => groupGamesForDisplay(data)),
    [],
  );
  const { data: games, loading, error, reload } = useApiLoad(loader, [] as ApiGame[]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return games.filter((g) => {
      if (!matchesGamePlatformFilter(g, platformFilter)) return false;
      if (!q) return true;
      return g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q);
    });
  }, [games, search, platformFilter]);

  return (
    <View style={screen.root}>
      <AppHeader
        title={`🎮 ${t('games')}`}
        onNotificationsPress={onNotificationsPress}
        notificationRefreshKey={notificationRefreshKey}
        onLangChange={() => langBump((n) => n + 1)}
      />
      <ScrollView contentContainerStyle={screen.content}>
        <TextInput
          style={screen.searchInput}
          placeholder={`🔍 ${t('searchGames')}...`}
          placeholderTextColor={colors.darkGray}
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {PLATFORM_CHIPS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, platformFilter === opt.id && styles.chipActive]}
              onPress={() => setPlatformFilter(opt.id)}
            >
              <Text style={[styles.chipText, platformFilter === opt.id && styles.chipTextActive]}>
                {t(opt.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {loading ? (
          <ActivityIndicator color={colors.violet} size="large" />
        ) : error && games.length === 0 ? (
          <NetworkErrorView message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <Text style={screen.emptyText}>No games found</Text>
        ) : (
          filtered.map((g) => (
            <GameCard
              key={g.code}
              game={g}
              onPress={() => onGamePress(g.code, g.imageUrl)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chipsRow: { marginBottom: spacing.md, flexGrow: 0 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.violet,
    borderColor: colors.violet,
  },
  chipText: { color: colors.darkGray, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.white },
});

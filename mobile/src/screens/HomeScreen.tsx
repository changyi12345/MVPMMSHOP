import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { ApiGame, fetchGames } from '../data/mockData';
import { fetchVoucherCategories, VoucherCategory } from '../api/vouchers';
import { MLBB_UNIFIED_CODE } from '../data/mlbb-regions';
import { groupGamesForDisplay } from '../utils/groupGames';
import { colors, spacing, radius } from '../theme/colors';
import GameCard from '../components/GameCard';
import VoucherCategoryCard from '../components/VoucherCategoryCard';
import Button from '../components/Button';
import NetworkErrorView from '../components/NetworkErrorView';
import { fetchHomeContent, HomeContent } from '../api/content';
import { getCachedShopSettings } from '../api/settings';
import { useApiLoad } from '../hooks/useApiLoad';
import AppHeader from '../components/AppHeader';
import { t, subscribeLang, getLang } from '../i18n';
import { persistLang } from '../api/authStorage';

interface Props {
  onGamePress: (slug: string, imageUrl?: string | null) => void;
  onVoucherCategoryPress: (categoryId: number, title: string) => void;
  onViewAllVouchers: () => void;
  onReferralPress: () => void;
  onEventsPress?: () => void;
  onEventPress?: (slug: string) => void;
  onNotificationsPress?: () => void;
  notificationRefreshKey?: number;
}

export default function HomeScreen({
  onGamePress,
  onVoucherCategoryPress,
  onViewAllVouchers,
  onReferralPress,
  onEventsPress,
  onEventPress,
  onNotificationsPress,
  notificationRefreshKey,
}: Props) {
  const [, langBump] = useState(0);
  useEffect(() => subscribeLang(() => langBump((n) => n + 1)), []);

  const loadHome = useCallback(async () => {
    const [gamesResult, homeResult, vouchersResult] = await Promise.allSettled([
      fetchGames().then((data) => groupGamesForDisplay(data)),
      fetchHomeContent(),
      fetchVoucherCategories(),
    ]);

    const games = gamesResult.status === 'fulfilled' ? gamesResult.value : [];
    const vouchers = vouchersResult.status === 'fulfilled' ? vouchersResult.value.slice(0, 8) : [];
    let home: HomeContent | null =
      homeResult.status === 'fulfilled' ? homeResult.value : null;

    if (!home) {
      const cached = getCachedShopSettings();
      if (cached) {
        home = {
          shopName: cached.shopName,
          shopTagline: null,
          logoUrl: null,
          heroBanners: [],
          midBanners: [],
          events: [],
        };
      }
    }

    if (
      gamesResult.status === 'rejected' &&
      homeResult.status === 'rejected' &&
      vouchersResult.status === 'rejected'
    ) {
      throw gamesResult.reason;
    }

    return { games, home, vouchers };
  }, []);

  const { data, loading, error, isOffline, reload } = useApiLoad(loadHome, {
    games: [] as ApiGame[],
    home: null as HomeContent | null,
    vouchers: [] as VoucherCategory[],
  });

  const shopName = data.home?.shopName ?? 'MVPMMSHOP';
  const tagline = data.home?.shopTagline ?? 'Fast & Trusted — Instant Delivery';
  const heroBanner = data.home?.heroBanners?.[0];
  const showCachedHint = isOffline && data.home != null;

  if (!loading && error && data.games.length === 0 && !data.home && data.vouchers.length === 0) {
    return (
      <View style={styles.container}>
        <NetworkErrorView message={error} onRetry={reload} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <AppHeader
        left={
          data.home?.logoUrl ? (
            <Image source={{ uri: data.home.logoUrl }} style={styles.logoImage} resizeMode="contain" />
          ) : (
            <Text style={styles.logo}>{shopName}</Text>
          )
        }
        onNotificationsPress={onNotificationsPress}
        notificationRefreshKey={notificationRefreshKey}
        onLangChange={() => {
          persistLang(getLang());
          langBump((n) => n + 1);
        }}
      />

      {showCachedHint && (
        <Text style={styles.cachedHint}>{t('usingCachedData')}</Text>
      )}

      {heroBanner?.imageUrl ? (
        <Image source={{ uri: heroBanner.imageUrl }} style={styles.heroBanner} resizeMode="cover" />
      ) : (
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{t('popularGames')}</Text>
          <Text style={styles.heroSub}>{tagline}</Text>
          <Button title={t('browseGames')} variant="secondary" onPress={() => onGamePress(MLBB_UNIFIED_CODE)} />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>🔥 {t('popularGames')}</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.violet} style={{ marginVertical: spacing.lg }} />
        ) : error && data.games.length === 0 ? (
          <NetworkErrorView message={error} onRetry={reload} compact />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data.games.map((g) => (
              <GameCard key={g.code} game={g} compact onPress={() => onGamePress(g.code, g.imageUrl)} />
            ))}
          </ScrollView>
        )}
      </View>

      {data.vouchers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>🎁 {t('vouchersGiftCards')}</Text>
            <TouchableOpacity onPress={onViewAllVouchers}>
              <Text style={styles.viewAll}>{t('viewAll')} →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data.vouchers.map((c) => (
              <VoucherCategoryCard
                key={c.id}
                category={c}
                compact
                onPress={() => onVoucherCategoryPress(c.id, c.title)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {(data.home?.events?.length ?? 0) > 0 && onEventsPress && (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>📰 {t('eventsNews')}</Text>
            <TouchableOpacity onPress={onEventsPress}>
              <Text style={styles.viewAll}>{t('viewAll')} →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data.home!.events.slice(0, 6).map((e) => (
              <TouchableOpacity
                key={e.id}
                style={styles.eventCard}
                onPress={() => (onEventPress ? onEventPress(e.slug) : onEventsPress?.())}
              >
                {e.imageUrl ? (
                  <Image source={{ uri: e.imageUrl }} style={styles.eventImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.eventImage, styles.eventPlaceholder]}>
                    <Text style={styles.eventPlaceholderText}>📰</Text>
                  </View>
                )}
                <Text style={styles.eventTitle} numberOfLines={2}>{e.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.section, { marginBottom: spacing.xl }]}>
        <View style={styles.promoBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>🎁 {t('referEarn')}</Text>
            <Text style={styles.promoSub}>{t('referSub')}</Text>
          </View>
          <TouchableOpacity style={styles.promoBtn} onPress={onReferralPress}>
            <Text style={styles.promoBtnText}>{t('join')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  logo: { color: colors.violetLight, fontSize: 22, fontWeight: '800' },
  logoImage: { width: 140, height: 40 },
  cachedHint: {
    textAlign: 'center',
    color: colors.cyan,
    fontSize: 12,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  heroBanner: { width: '100%', height: 180, marginBottom: spacing.md },
  hero: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.35)',
    borderTopWidth: 3,
    borderTopColor: colors.cyan,
  },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: colors.darkGray, marginBottom: spacing.md },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
  viewAll: { color: colors.cyan, fontSize: 14, fontWeight: '600' },
  eventCard: {
    width: 160,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  eventImage: { width: '100%', height: 90 },
  eventPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  eventPlaceholderText: { fontSize: 28 },
  eventTitle: { color: colors.white, fontSize: 13, fontWeight: '600', padding: spacing.sm },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.25)',
  },
  promoTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
  promoSub: { color: colors.darkGray, fontSize: 13, marginTop: 4 },
  promoBtn: { backgroundColor: colors.cyan, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  promoBtnText: { color: colors.black, fontWeight: '700' },
});

import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { ApiGame, fetchGames } from '../data/mockData';
import { fetchVoucherCategories, VoucherCategory } from '../api/vouchers';
import { MLBB_UNIFIED_CODE } from '../data/mlbb-regions';
import { groupGamesForDisplay } from '../utils/groupGames';
import { colors, spacing, radius, shadows } from '../theme/colors';
import GameCard from '../components/GameCard';
import VoucherCategoryCard from '../components/VoucherCategoryCard';
import Button from '../components/Button';
import NetworkErrorView from '../components/NetworkErrorView';
import { fetchHomeContent, HomeContent, ShopBanner } from '../api/content';
import { getCachedShopSettings } from '../api/settings';
import { useApiLoad } from '../hooks/useApiLoad';
import MainHeader from '../components/MainHeader';
import BannerCarousel from '../components/BannerCarousel';
import HomeSection from '../components/HomeSection';
import { BRAND, resolveBannerSource } from '../lib/branding';
import { UI_EMOJI } from '../lib/uiIcons';
import { QuickNavIcon } from '../components/TabIcon';
import { t, subscribeLang, getLang } from '../i18n';
import { persistLang } from '../api/authStorage';

interface Props {
  onGamePress: (slug: string, imageUrl?: string | null) => void;
  onVoucherCategoryPress: (categoryId: number, title: string) => void;
  onViewAllGames?: () => void;
  onViewAllVouchers: () => void;
  onWalletPress?: () => void;
  onOrdersPress?: () => void;
  onReferralPress: () => void;
  onEventsPress?: () => void;
  onEventPress?: (slug: string) => void;
  onNotificationsPress?: () => void;
  notificationRefreshKey?: number;
}

type QuickTone = 'violet' | 'cyan' | 'pink' | 'amber';

const QUICK_LINKS: {
  icon: 'games' | 'vouchers' | 'wallet' | 'orders';
  labelKey: string;
  tone: QuickTone;
  action: 'games' | 'vouchers' | 'wallet' | 'orders';
}[] = [
  { icon: 'games', labelKey: 'browseGames', tone: 'violet', action: 'games' },
  { icon: 'vouchers', labelKey: 'viewVouchers', tone: 'cyan', action: 'vouchers' },
  { icon: 'wallet', labelKey: 'wallet', tone: 'pink', action: 'wallet' },
  { icon: 'orders', labelKey: 'orders', tone: 'amber', action: 'orders' },
];

const quickIconColor: Record<QuickTone, string> = {
  violet: colors.violetDark,
  cyan: colors.cyanDark,
  pink: colors.pink,
  amber: colors.amber,
};

const toneBg: Record<QuickTone, string> = {
  violet: 'rgba(99, 102, 241, 0.12)',
  cyan: 'rgba(6, 182, 212, 0.12)',
  pink: 'rgba(236, 72, 153, 0.12)',
  amber: 'rgba(245, 158, 11, 0.12)',
};

const toneBorder: Record<QuickTone, string> = {
  violet: colors.violet,
  cyan: colors.cyan,
  pink: colors.pink,
  amber: colors.amber,
};

export default function HomeScreen({
  onGamePress,
  onVoucherCategoryPress,
  onViewAllGames,
  onViewAllVouchers,
  onWalletPress,
  onOrdersPress,
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

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const cachedSettings = getCachedShopSettings();
  const shopName = data.home?.shopName ?? cachedSettings?.shopName ?? BRAND.shortName;
  const tagline = data.home?.shopTagline ?? t('heroDefaultSubtitle');
  const paymentMethods = cachedSettings?.paymentMethods ?? ['KBZ Pay', 'Wave Pay', 'Bank Transfer'];
  const showCachedHint = isOffline && data.home != null;

  const handleQuickNav = (action: (typeof QUICK_LINKS)[number]['action']) => {
    if (action === 'games') onViewAllGames?.();
    else if (action === 'vouchers') onViewAllVouchers();
    else if (action === 'wallet') onWalletPress?.();
    else if (action === 'orders') onOrdersPress?.();
  };

  const handleBannerPress = (banner: ShopBanner) => {
    const link = banner.linkUrl ?? '';
    if (link.includes('voucher')) onViewAllVouchers();
    else if (link.includes('game') || link.includes('/games')) onViewAllGames?.();
  };

  const handleTopUp = () => {
    if (onViewAllGames) onViewAllGames();
    else onGamePress(MLBB_UNIFIED_CODE);
  };

  if (!loading && error && data.games.length === 0 && !data.home && data.vouchers.length === 0) {
    return (
      <View style={styles.container}>
        <NetworkErrorView message={error} onRetry={reload} />
      </View>
    );
  }

  return (
    <View style={styles.pageRoot}>
      <View style={styles.bgTop} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.violet} />
        }
      >
      <MainHeader
        shopName={shopName}
        shopLogoUrl={data.home?.logoUrl}
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

      <BannerCarousel
        banners={data.home?.heroBanners ?? []}
        onBannerPress={handleBannerPress}
      />

      <View style={styles.pageBody}>
        <View style={styles.intro}>
          <View style={styles.introCopy}>
            <Text style={styles.introKicker}>{t('fastSafeTrusted')}</Text>
            <Text style={styles.introTitle}>{shopName}</Text>
            <Text style={styles.introTagline}>{tagline}</Text>
          </View>
          <View style={styles.introActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleTopUp} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>{t('topUpNow')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onViewAllVouchers} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>{t('viewVouchers')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickNav}>
          {QUICK_LINKS.map((item) => (
            <TouchableOpacity
              key={item.action}
              style={[styles.quickCard, { borderBottomColor: toneBorder[item.tone] }]}
              onPress={() => handleQuickNav(item.action)}
              activeOpacity={0.85}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: toneBg[item.tone] }]}>
                <QuickNavIcon name={item.icon} size={24} color={quickIconColor[item.tone]} />
              </View>
              <Text style={styles.quickLabel}>{t(item.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {(data.home?.midBanners?.length ?? 0) > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.midBannerRow}>
            {data.home!.midBanners.map((banner) => (
              <TouchableOpacity
                key={banner.id}
                style={styles.midBannerCard}
                onPress={() => handleBannerPress(banner)}
                activeOpacity={0.9}
              >
                <Image
                  source={resolveBannerSource(banner)}
                  style={styles.midBannerImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <HomeSection badge={`${UI_EMOJI.hot} ${t('badgeHot')}`} title={t('popularGames')} onViewAll={onViewAllGames}>
          {loading ? (
            <ActivityIndicator color={colors.violet} style={{ marginVertical: spacing.lg }} />
          ) : error && data.games.length === 0 ? (
            <NetworkErrorView message={error} onRetry={reload} compact />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.games.slice(0, 12).map((g) => (
                <GameCard
                  key={g.code}
                  game={g}
                  compact
                  home
                  onPress={() => onGamePress(g.code, g.imageUrl)}
                />
              ))}
            </ScrollView>
          )}
        </HomeSection>

        {data.vouchers.length > 0 && (
          <HomeSection
            badge={`🎁 ${t('badgeDeals')}`}
            badgeTone="cyan"
            title={t('vouchersGiftCards')}
            onViewAll={onViewAllVouchers}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.vouchers.map((c) => (
                <VoucherCategoryCard
                  key={c.id}
                  category={c}
                  compact
                  home
                  onPress={() => onVoucherCategoryPress(c.id, c.title)}
                />
              ))}
            </ScrollView>
          </HomeSection>
        )}

        {(data.home?.events?.length ?? 0) > 0 && onEventsPress && (
          <HomeSection badge={`${UI_EMOJI.events} ${t('badgeNews')}`} title={t('eventsNews')} onViewAll={onEventsPress}>
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
                      <Text style={styles.eventPlaceholderText}>{UI_EMOJI.events}</Text>
                    </View>
                  )}
                  <Text style={styles.eventTitle} numberOfLines={2}>{e.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </HomeSection>
        )}

        <HomeSection
          badge={`${UI_EMOJI.new} ${t('badgeTrusted')}`}
          badgeTone="violet"
          title={`${t('whyChoose')} ${shopName}`}
          centered
        >
          <View style={styles.features}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, styles.featureIconViolet]}>
                <Text>{UI_EMOJI.flash}</Text>
              </View>
              <Text style={styles.featureTitle}>{t('featureInstantDelivery')}</Text>
              <Text style={styles.featureDesc}>{t('featureInstantDesc')}</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, styles.featureIconCyan]}>
                <Text>{UI_EMOJI.lock}</Text>
              </View>
              <Text style={styles.featureTitle}>{t('featureSecurePayment')}</Text>
              <Text style={styles.featureDesc}>{t('featureSecureDesc')}</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, styles.featureIconPink]}>
                <Text>{UI_EMOJI.chat}</Text>
              </View>
              <Text style={styles.featureTitle}>{t('featureSupport')}</Text>
              <Text style={styles.featureDesc}>{t('featureSupportDesc')}</Text>
            </View>
          </View>
        </HomeSection>

        <View style={styles.trustBar}>
          <Text style={styles.trustIcon}>{UI_EMOJI.trust}</Text>
          <View style={styles.trustContent}>
            <Text style={styles.trustLabel}>{t('paymentMethods')}</Text>
            <View style={styles.trustPills}>
              {paymentMethods.map((method) => (
                <View key={method} style={styles.trustPill}>
                  <Text style={styles.trustPillText}>{method}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.referralCta}>
          <View style={styles.referralContent}>
            <Text style={styles.referralEmoji}>🎁</Text>
            <View style={styles.referralCopy}>
              <Text style={styles.referralTitle}>{t('referEarn')}</Text>
              <Text style={styles.referralDesc}>{t('referEarnDesc')}</Text>
            </View>
          </View>
          <Button title={t('getReferralCode')} onPress={onReferralPress} small />
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageRoot: { flex: 1, backgroundColor: colors.background },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: colors.backgroundTop,
  },
  container: { flex: 1, backgroundColor: 'transparent' },
  pageBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  cachedHint: {
    textAlign: 'center',
    color: colors.cyanDark,
    fontSize: 12,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  intro: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    ...shadows.card,
  },
  introCopy: { marginBottom: spacing.md },
  introKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.kicker,
    marginBottom: 6,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textTitle,
    marginBottom: 4,
  },
  introTagline: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  introActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.violet,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: radius.pill,
    shadowColor: colors.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  secondaryBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'rgba(15, 23, 42, 0.12)',
  },
  secondaryBtnText: { color: colors.textTitle, fontWeight: '700', fontSize: 14 },
  quickNav: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 92,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    borderBottomWidth: 3,
    ...shadows.sm,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  midBannerRow: { marginBottom: spacing.lg, marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
  midBannerCard: {
    width: 280,
    height: 100,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderBrand,
    ...shadows.sm,
  },
  midBannerImage: { width: '100%', height: '100%' },
  eventCard: {
    width: 160,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  eventImage: { width: '100%', height: 90 },
  eventPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted },
  eventPlaceholderText: { fontSize: 28 },
  eventTitle: { fontSize: 13, fontWeight: '600', color: colors.text, padding: spacing.sm },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  featureCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    ...shadows.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureIconViolet: { backgroundColor: 'rgba(99,102,241,0.12)' },
  featureIconCyan: { backgroundColor: 'rgba(6,182,212,0.12)' },
  featureIconPink: { backgroundColor: 'rgba(236,72,153,0.12)' },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textTitle,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  trustBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    ...shadows.sm,
  },
  trustIcon: { fontSize: 28 },
  trustContent: { flex: 1 },
  trustLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  trustPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  trustPill: {
    backgroundColor: colors.backgroundTop,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.borderBrand,
  },
  trustPillText: { fontSize: 12, fontWeight: '600', color: colors.text },
  referralCta: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.25)',
    gap: spacing.md,
    ...shadows.card,
  },
  referralContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  referralEmoji: { fontSize: 36 },
  referralCopy: { flex: 1 },
  referralTitle: { fontSize: 16, fontWeight: '800', color: colors.textTitle },
  referralDesc: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});

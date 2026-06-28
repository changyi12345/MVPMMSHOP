import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, shadows } from '../theme/colors';
import { BRAND } from '../lib/branding';
import { getCachedShopSettings } from '../api/settings';
import LogoMarkRing from './LogoMarkRing';
import NotificationBell from './NotificationBell';
import LangToggle from './LangToggle';

interface Props {
  shopName?: string;
  shopLogoUrl?: string | null;
  onNotificationsPress?: () => void;
  notificationRefreshKey?: number;
  onLangChange?: () => void;
  style?: ViewStyle;
}

/** Web sticky header — dark gradient + logo ring + shop name */
export default function MainHeader({
  shopName = 'MVPMMSHOP',
  shopLogoUrl,
  onNotificationsPress,
  notificationRefreshKey,
  onLangChange,
  style,
}: Props) {
  const cached = getCachedShopSettings();
  const name = shopName ?? cached?.shopName ?? BRAND.shortName;
  const logo = shopLogoUrl ?? cached?.logoUrl ?? null;

  return (
    <View style={[styles.outer, style]}>
      <View style={styles.gradientTop} />
      <View style={styles.gradient}>
        <View style={styles.row}>
          <View style={styles.brand}>
            <LogoMarkRing shopLogoUrl={logo} size={38} />
            <View style={styles.brandText}>
              <Text style={styles.shopName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.shopTag} numberOfLines={1}>
                Game Top-Up
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <LangToggle onChange={onLangChange} light />
            {onNotificationsPress ? (
              <NotificationBell
                onPress={onNotificationsPress}
                refreshKey={notificationRefreshKey}
                light
              />
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.gradientBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    ...shadows.sm,
  },
  gradientTop: {
    height: 4,
    backgroundColor: colors.cyan,
    opacity: 0.85,
  },
  gradient: {
    backgroundColor: colors.header,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  gradientBottom: {
    height: 12,
    backgroundColor: colors.header,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: -4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  brandText: { flex: 1, minWidth: 0 },
  shopName: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  shopTag: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, spacing, shadows } from '../theme/colors';
import { t, subscribeLang } from '../i18n';
import TabIcon from './TabIcon';
import type { TabId } from '../lib/uiIcons';

export type { TabId };

interface TabBarProps {
  active: TabId;
  onTabPress: (tab: TabId) => void;
  cartCount?: number;
}

const tabs: { id: TabId; labelKey: string }[] = [
  { id: 'home', labelKey: 'home' },
  { id: 'games', labelKey: 'games' },
  { id: 'vouchers', labelKey: 'vouchers' },
  { id: 'cart', labelKey: 'cart' },
  { id: 'orders', labelKey: 'orders' },
  { id: 'profile', labelKey: 'profile' },
];

export default function TabBar({ active, onTabPress, cartCount = 0 }: TabBarProps) {
  const [, bump] = React.useState(0);
  React.useEffect(() => subscribeLang(() => bump((n) => n + 1)), []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.accentBar} />
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <TabIcon tab={tab.id} active={isActive} size={22} />
                {tab.id === 'cart' && cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]} numberOfLines={1}>
                {t(tab.labelKey)}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.headerDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    ...shadows.card,
  },
  accentBar: {
    height: 3,
    backgroundColor: colors.cyan,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'android' ? spacing.md + 4 : spacing.sm,
    paddingHorizontal: 4,
    backgroundColor: colors.header,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.45)',
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeLabel: {
    color: colors.white,
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cyan,
    marginTop: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: colors.pink,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.header,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
});

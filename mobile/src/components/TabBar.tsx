import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { formatPrice } from '../data/mockData';
import { t, subscribeLang } from '../i18n';

export type TabId = 'home' | 'games' | 'vouchers' | 'cart' | 'orders' | 'profile';

interface TabBarProps {
  active: TabId;
  onTabPress: (tab: TabId) => void;
  cartCount?: number;
}

const tabs: { id: TabId; icon: string; labelKey: string }[] = [
  { id: 'home', icon: '🏠', labelKey: 'home' },
  { id: 'games', icon: '🎮', labelKey: 'games' },
  { id: 'vouchers', icon: '🎁', labelKey: 'vouchers' },
  { id: 'cart', icon: '🛒', labelKey: 'cart' },
  { id: 'orders', icon: '📦', labelKey: 'orders' },
  { id: 'profile', icon: '👤', labelKey: 'profile' },
];

export default function TabBar({ active, onTabPress, cartCount = 0 }: TabBarProps) {
  const [, bump] = useState(0);
  useEffect(() => subscribeLang(() => bump((n) => n + 1)), []);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <View>
            <Text style={[styles.icon, active === tab.id && styles.active]}>{tab.icon}</Text>
            {tab.id === 'cart' && cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.label, active === tab.id && styles.activeLabel]}>{t(tab.labelKey)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  icon: { fontSize: 22, opacity: 0.6, textAlign: 'center' },
  active: { opacity: 1 },
  label: { fontSize: 10, color: colors.darkGray, fontWeight: '500' },
  activeLabel: { color: colors.cyan, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.violet,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
});

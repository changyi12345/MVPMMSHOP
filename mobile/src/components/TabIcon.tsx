import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import type { TabId } from '../lib/uiIcons';

const TAB_ICON_NAMES: Record<TabId, { active: string; inactive: string }> = {
  home: { active: 'home', inactive: 'home-outline' },
  games: { active: 'game-controller', inactive: 'game-controller-outline' },
  vouchers: { active: 'gift', inactive: 'gift-outline' },
  cart: { active: 'cart', inactive: 'cart-outline' },
  orders: { active: 'receipt', inactive: 'receipt-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export const QUICK_ICON_NAMES = {
  games: 'game-controller-outline',
  vouchers: 'gift-outline',
  wallet: 'wallet-outline',
  orders: 'receipt-outline',
  home: 'home-outline',
} as const;

type Props = {
  tab: TabId;
  active?: boolean;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Crisp vector tab icon — Ionicons (no blurry PNG letters). */
export default function TabIcon({ tab, active = false, size = 22, color, style }: Props) {
  const names = TAB_ICON_NAMES[tab];
  const iconName = active ? names.active : names.inactive;
  const iconColor = color ?? (active ? colors.white : 'rgba(255,255,255,0.55)');

  return (
    <View style={[styles.wrap, style]}>
      <Ionicons name={iconName} size={size} color={iconColor} />
    </View>
  );
}

type QuickProps = {
  name: keyof typeof QUICK_ICON_NAMES;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function QuickNavIcon({ name, size = 24, color = colors.violetDark, style }: QuickProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Ionicons name={QUICK_ICON_NAMES[name]} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

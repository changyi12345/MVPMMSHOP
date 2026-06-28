import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme/colors';
import NotificationBell from './NotificationBell';
import LangToggle from './LangToggle';

interface Props {
  title?: string;
  left?: React.ReactNode;
  onNotificationsPress?: () => void;
  notificationRefreshKey?: number;
  onLangChange?: () => void;
  style?: ViewStyle;
  light?: boolean;
}

export default function AppHeader({
  title,
  left,
  onNotificationsPress,
  notificationRefreshKey,
  onLangChange,
  style,
  light = true,
}: Props) {
  return (
    <View style={[styles.row, light ? styles.rowLight : styles.rowDark, style]}>
      <View style={styles.left}>{left ?? (title ? <Text style={styles.title}>{title}</Text> : null)}</View>
      <View style={styles.actions}>
        <LangToggle onChange={onLangChange} />
        {onNotificationsPress ? (
          <NotificationBell onPress={onNotificationsPress} refreshKey={notificationRefreshKey} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  rowLight: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowDark: {
    backgroundColor: colors.header,
  },
  left: { flex: 1 },
  title: { color: colors.textTitle, fontSize: 20, fontWeight: '800' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

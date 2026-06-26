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
}

export default function AppHeader({
  title,
  left,
  onNotificationsPress,
  notificationRefreshKey,
  onLangChange,
  style,
}: Props) {
  return (
    <View style={[styles.row, style]}>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  left: { flex: 1 },
  title: { color: colors.white, fontSize: 22, fontWeight: '800' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

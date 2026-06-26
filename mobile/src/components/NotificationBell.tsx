import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { fetchUnreadNotificationCount } from '../api/notifications';

interface Props {
  onPress: () => void;
  refreshKey?: number;
}

export default function NotificationBell({ onPress, refreshKey = 0 }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchUnreadNotificationCount()
      .then((res) => {
        if (!cancelled) setCount(res.count);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.wrap} accessibilityLabel="Notifications">
      <Text style={styles.icon}>🔔</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xs, position: 'relative' },
  icon: { fontSize: 22 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.cyan,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
});

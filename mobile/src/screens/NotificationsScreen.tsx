import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import Button from '../components/Button';
import {
  fetchUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationIcon,
  UserNotification,
} from '../api/notifications';
import { t } from '../i18n';

interface Props {
  onBack: () => void;
  onRead?: () => void;
}

export default function NotificationsScreen({ onBack, onRead }: Props) {
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchUserNotifications({ limit: 50 });
    setItems(data);
  }, []);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [load]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleOpen = async (item: UserNotification) => {
    if (!item.read) {
      await markNotificationRead(item.id).catch(() => {});
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
      onRead?.();
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    onRead?.();
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('notifications')}</Text>
        {unread > 0 ? (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markAll}>{t('markAllRead')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 72 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.violet} style={{ marginTop: 32 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={colors.cyan} />}
        >
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>{t('noNotifications')}</Text>
            </View>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, !item.read && styles.unread]}
                onPress={() => handleOpen(item)}
              >
                <Text style={styles.icon}>{notificationIcon(item.type)}</Text>
                <View style={styles.body}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardBody}>{item.body}</Text>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                {!item.read && <View style={styles.dot} />}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  back: { color: colors.cyan, fontSize: 16, width: 72 },
  title: { color: colors.white, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  markAll: { color: colors.violetLight, fontSize: 12, fontWeight: '600', width: 72, textAlign: 'right' },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.sm },
  emptyText: { color: colors.darkGray },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  unread: { borderLeftWidth: 3, borderLeftColor: colors.cyan },
  icon: { fontSize: 24 },
  body: { flex: 1 },
  cardTitle: { color: colors.white, fontWeight: '700', marginBottom: 4 },
  cardBody: { color: colors.darkGray, fontSize: 14, lineHeight: 20 },
  date: { color: colors.darkGray, fontSize: 11, marginTop: 6, opacity: 0.8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cyan,
    marginTop: 4,
  },
});

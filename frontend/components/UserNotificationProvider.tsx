'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchUnreadNotificationCount,
  fetchUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification,
} from '@/lib/api/notifications';
import { useAuthUser } from '@/lib/use-auth';

const POLL_MS = 30_000;

interface UserNotificationsState {
  unreadCount: number;
  items: UserNotification[];
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const UserNotificationsContext = createContext<UserNotificationsState | null>(null);

export function useUserNotifications() {
  const ctx = useContext(UserNotificationsContext);
  if (!ctx) {
    return {
      unreadCount: 0,
      items: [] as UserNotification[],
      loading: false,
      refresh: async () => {},
      markRead: async () => {},
      markAllRead: async () => {},
    };
  }
  return ctx;
}

export default function UserNotificationProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, ready } = useAuthUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const [countRes, list] = await Promise.all([
        fetchUnreadNotificationCount(),
        fetchUserNotifications({ limit: 30 }),
      ]);
      setUnreadCount(countRes.count);
      setItems(list);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const markRead = useCallback(async (id: number) => {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) {
      setUnreadCount(0);
      setItems([]);
      return;
    }
    void refresh();
    const id = setInterval(refresh, POLL_MS);
    const onAuth = () => void refresh();
    window.addEventListener('authchange', onAuth);
    return () => {
      clearInterval(id);
      window.removeEventListener('authchange', onAuth);
    };
  }, [ready, isLoggedIn, refresh]);

  return (
    <UserNotificationsContext.Provider
      value={{ unreadCount, items, loading, refresh, markRead, markAllRead }}
    >
      {children}
    </UserNotificationsContext.Provider>
  );
}

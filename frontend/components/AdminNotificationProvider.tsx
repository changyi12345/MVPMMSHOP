'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { fetchAdminNotifications, AdminNotificationItem } from '@/lib/api/admin';
import { playAdminAlertSound, unlockAdminSound } from '@/lib/admin-notify-sound';
import { useToast } from '@/components/Toast';

const SEEN_KEY = 'admin_seen_notif_keys';
const BOOT_KEY = 'admin_notif_bootstrapped';
const SOUND_KEY = 'admin_notif_sound';
const POLL_MS = 20_000;

interface AdminNotificationsState {
  pendingOrders: number;
  pendingWalletTopups: number;
  totalPending: number;
  items: AdminNotificationItem[];
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  refresh: () => Promise<void>;
}

const AdminNotificationsContext = createContext<AdminNotificationsState | null>(null);

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationsContext);
  if (!ctx) {
    return {
      pendingOrders: 0,
      pendingWalletTopups: 0,
      totalPending: 0,
      items: [] as AdminNotificationItem[],
      soundEnabled: true,
      setSoundEnabled: () => {},
      refresh: async () => {},
    };
  }
  return ctx;
}

function loadSeen(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  const arr = Array.from(seen).slice(-120);
  sessionStorage.setItem(SEEN_KEY, JSON.stringify(arr));
}

function showBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body });
  } catch {
    // ignore
  }
}

export default function AdminNotificationProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const seenRef = useRef(loadSeen());
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingWalletTopups, setPendingWalletTopups] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SOUND_KEY);
    if (stored != null) setSoundEnabledState(stored === '1');
  }, []);

  const setSoundEnabled = useCallback((v: boolean) => {
    setSoundEnabledState(v);
    localStorage.setItem(SOUND_KEY, v ? '1' : '0');
    if (v) unlockAdminSound();
  }, []);

  const processAlerts = useCallback(
    (data: Awaited<ReturnType<typeof fetchAdminNotifications>>, playSound: boolean) => {
      const bootstrapped = sessionStorage.getItem(BOOT_KEY) === '1';
      const newItems: AdminNotificationItem[] = [];

      for (const item of data.items) {
        if (!seenRef.current.has(item.key)) {
          if (bootstrapped) newItems.push(item);
          seenRef.current.add(item.key);
        }
      }

      saveSeen(seenRef.current);

      if (!bootstrapped) {
        sessionStorage.setItem(BOOT_KEY, '1');
        return;
      }

      if (newItems.length === 0) return;

      if (playSound && soundEnabled) {
        unlockAdminSound();
        playAdminAlertSound();
      }

      for (const item of newItems) {
        showToast(`🔔 ${item.title}: ${item.message}`, 'warning');
        showBrowserNotification(item.title, item.message);
      }
    },
    [showToast, soundEnabled],
  );

  const refresh = useCallback(async () => {
    try {
      const data = await fetchAdminNotifications();
      setPendingOrders(data.pendingOrders);
      setPendingWalletTopups(data.pendingWalletTopups);
      setTotalPending(data.totalPending);
      setItems(data.items);
      processAlerts(data, true);
    } catch {
      // silent
    }
  }, [processAlerts]);

  useEffect(() => {
    unlockAdminSound();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    void refresh();
    const id = setInterval(refresh, POLL_MS);

    const onInteract = () => unlockAdminSound();
    window.addEventListener('click', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      clearInterval(id);
      window.removeEventListener('click', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [refresh]);

  return (
    <AdminNotificationsContext.Provider
      value={{
        pendingOrders,
        pendingWalletTopups,
        totalPending,
        items,
        soundEnabled,
        setSoundEnabled,
        refresh,
      }}
    >
      {children}
    </AdminNotificationsContext.Provider>
  );
}

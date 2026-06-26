'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopPageShell from '@/components/ShopPageShell';
import { useUserNotifications } from '@/components/UserNotificationProvider';
import { notificationIcon } from '@/lib/api/notifications';
import { useLang } from '@/lib/useLang';
import { useAuthUser } from '@/lib/use-auth';

function timeAgo(iso: string, lang: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return lang === 'mm' ? 'ယခု' : 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(iso).toLocaleString();
}

export default function NotificationsPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const { isLoggedIn, ready } = useAuthUser();
  const { items, loading, unreadCount, markRead, markAllRead, refresh } = useUserNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!ready) {
    return (
      <ShopPageShell title={t('notifications')} emoji="🔔" badge="Inbox" maxWidth={640} centered>
        <p className="shop-muted" style={{ textAlign: 'center' }}>{t('loading')}</p>
      </ShopPageShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <ShopPageShell title={t('notifications')} emoji="🔔" badge="Inbox" maxWidth={640} centered>
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <p className="empty-text">{t('profileLoginRequired')}</p>
          <Link href="/auth/login?redirect=/notifications" className="btn btn-primary">{t('login')}</Link>
        </div>
      </ShopPageShell>
    );
  }

  const displayItems = filter === 'unread' ? items.filter((n) => !n.read) : items;

  return (
    <ShopPageShell title={t('notifications')} emoji="🔔" badge="Inbox" maxWidth={640}>
      <div className="inbox-toolbar">
        <div className="filter-chips">
          <button
            type="button"
            className={`chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('all')} ({items.length})
          </button>
          <button
            type="button"
            className={`chip ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            {t('unread')} ({unreadCount})
          </button>
        </div>
        <div className="inbox-toolbar-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => void refresh()}>
            ↻
          </button>
          {unreadCount > 0 && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => void markAllRead()}>
              {t('markAllRead')}
            </button>
          )}
        </div>
      </div>

      {loading && items.length === 0 ? (
        <p className="shop-muted" style={{ textAlign: 'center', padding: 32 }}>{t('loading')}</p>
      ) : displayItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-text">{t('noNotifications')}</p>
        </div>
      ) : (
        <ul className="inbox-list">
          {displayItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`inbox-item ${!item.read ? 'unread' : ''}`}
                onClick={async () => {
                  if (!item.read) await markRead(item.id);
                  if (item.url) router.push(item.url);
                }}
              >
                <span className="inbox-item-icon">{notificationIcon(item.type)}</span>
                <span className="inbox-item-body">
                  <span className="inbox-item-title">{item.title}</span>
                  <span className="inbox-item-msg">{item.body}</span>
                  <span className="inbox-item-meta">{timeAgo(item.createdAt, lang)}</span>
                </span>
                {!item.read && <span className="inbox-unread-dot" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </ShopPageShell>
  );
}

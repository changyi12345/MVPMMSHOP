'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useUserNotifications } from '@/components/UserNotificationProvider';
import { notificationIcon } from '@/lib/api/notifications';
import { useLang } from '@/lib/useLang';
import ShopIcon from './ShopIcon';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function UserNotificationBell({ inHeader = false }: { inHeader?: boolean }) {
  const router = useRouter();
  const { t } = useLang();
  const { unreadCount, items, refresh, markRead, markAllRead } = useUserNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleItemClick = async (id: number, url: string | null) => {
    if (!items.find((n) => n.id === id)?.read) {
      await markRead(id);
    }
    setOpen(false);
    if (url) router.push(url);
  };

  return (
    <div className="user-notif-wrap" ref={panelRef}>
      <button
        type="button"
        className={`user-notif-btn${inHeader ? ' user-notif-btn--header header-icon-btn' : ''}`}
        aria-label={`${t('notifications')}${unreadCount ? `, ${unreadCount} unread` : ''}`}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void refresh();
        }}
      >
        <ShopIcon name="bell" size={20} />
        {unreadCount > 0 && (
          <span className="user-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="user-notif-panel">
          <div className="user-notif-panel-head">
            <strong>{t('notifications')}</strong>
            <div className="user-notif-panel-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm user-notif-mark-all"
                  onClick={() => void markAllRead()}
                >
                  {t('markAllRead')}
                </button>
              )}
              <button type="button" className="btn btn-outline btn-sm" onClick={() => void refresh()}>
                ↻
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="user-notif-empty">{t('noNotifications')}</p>
          ) : (
            <ul className="user-notif-list">
              {items.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`user-notif-item ${!item.read ? 'unread' : ''}`}
                    onClick={() => void handleItemClick(item.id, item.url)}
                  >
                    <span className="user-notif-item-icon">{notificationIcon(item.type)}</span>
                    <span className="user-notif-item-body">
                      <span className="user-notif-item-title">{item.title}</span>
                      <span className="user-notif-item-msg">{item.body}</span>
                      <span className="user-notif-item-time">{timeAgo(item.createdAt)}</span>
                    </span>
                    {!item.read && <span className="user-notif-dot" aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="user-notif-panel-foot">
            <Link href="/notifications" className="user-notif-link" onClick={() => setOpen(false)}>
              {t('viewAllNotifications')} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

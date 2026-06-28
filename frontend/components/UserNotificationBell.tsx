'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const positionPanel = useCallback(() => {
    const btn = btnRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;

    const rect = btn.getBoundingClientRect();
    const panelWidth = Math.min(360, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 12));
    const top = rect.bottom + 8;

    panel.style.position = 'fixed';
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
    panel.style.right = 'auto';
    panel.style.width = `${panelWidth}px`;
    panel.style.zIndex = '1000';
  }, []);

  useEffect(() => {
    if (!open) return;
    positionPanel();
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    return () => {
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel, true);
    };
  }, [open, positionPanel]);

  const handleItemClick = async (id: number, url: string | null) => {
    if (!items.find((n) => n.id === id)?.read) {
      await markRead(id);
    }
    setOpen(false);
    if (url) router.push(url);
  };

  const panel = open ? (
    <div className="user-notif-panel user-notif-panel--portal" ref={panelRef} role="dialog" aria-label={t('notifications')}>
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
  ) : null;

  return (
    <div className="user-notif-wrap" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className={`user-notif-btn${inHeader ? ' user-notif-btn--header header-icon-btn' : ''}`}
        aria-label={`${t('notifications')}${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => {
            const next = !v;
            if (next) void refresh();
            return next;
          });
        }}
      >
        <ShopIcon name="bell" size={20} />
        {unreadCount > 0 && (
          <span className="user-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

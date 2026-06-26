'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAdminNotifications } from '@/components/AdminNotificationProvider';
import { unlockAdminSound } from '@/lib/admin-notify-sound';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminNotificationBell() {
  const { totalPending, items, soundEnabled, setSoundEnabled, refresh } = useAdminNotifications();
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

  return (
    <div className="admin-notif-wrap" ref={panelRef}>
      <button
        type="button"
        className="admin-notif-btn"
        aria-label={`Notifications${totalPending ? `, ${totalPending} pending` : ''}`}
        onClick={() => {
          unlockAdminSound();
          setOpen((v) => !v);
          if (!open) void refresh();
        }}
      >
        🔔
        {totalPending > 0 && (
          <span className="admin-notif-badge">{totalPending > 99 ? '99+' : totalPending}</span>
        )}
      </button>

      {open && (
        <div className="admin-notif-panel">
          <div className="admin-notif-panel-head">
            <strong>Notifications</strong>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => void refresh()}>
              ↻
            </button>
          </div>

          <label className="admin-notif-sound-toggle">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            Alert sound 🔊
          </label>

          {items.length === 0 ? (
            <p className="admin-notif-empty">No pending alerts</p>
          ) : (
            <ul className="admin-notif-list">
              {items.slice(0, 12).map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="admin-notif-item"
                    onClick={() => setOpen(false)}
                  >
                    <span className="admin-notif-item-icon">
                      {item.type === 'order' ? '📦' : item.type === 'g2bulk_price' ? '📈' : '💳'}
                    </span>
                    <span className="admin-notif-item-body">
                      <span className="admin-notif-item-title">{item.title}</span>
                      <span className="admin-notif-item-msg">{item.message}</span>
                      <span className="admin-notif-item-time">{timeAgo(item.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="admin-notif-panel-foot">
            <Link href="/admin/orders" className="admin-notif-link" onClick={() => setOpen(false)}>
              Orders
            </Link>
            <Link href="/admin/wallet" className="admin-notif-link" onClick={() => setOpen(false)}>
              Wallet
            </Link>
            <Link href="/admin/g2bulk" className="admin-notif-link" onClick={() => setOpen(false)}>
              G2Bulk
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

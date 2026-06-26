'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ConfirmModal from '@/components/ConfirmModal';
import { fetchAdminUsers, type AdminUser } from '@/lib/api/admin';
import { notificationIcon, sendAdminUserNotification } from '@/lib/api/notifications';
import { useAdminLang } from '@/lib/useAdminLang';
import { useToast } from '@/components/Toast';

type RecipientMode = 'all' | 'user';

type RecentSend = {
  title: string;
  body: string;
  sent: number;
  at: string;
};

const RECENT_KEY = 'admin_notif_recent';
const QUICK_LINKS = [
  { label: 'Home', url: '/' },
  { label: 'Events', url: '/events' },
  { label: 'Games', url: '/games' },
  { label: 'Vouchers', url: '/vouchers' },
  { label: 'Wallet', url: '/wallet' },
];

function loadRecent(): RecentSend[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentSend[];
  } catch {
    return [];
  }
}

function saveRecent(entry: RecentSend) {
  const list = [entry, ...loadRecent()].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

function formatVars(text: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    text,
  );
}

export default function AdminSendNotificationsPage() {
  const { t } = useAdminLang();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<RecipientMode>('all');
  const [userId, setUserId] = useState<number | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recent, setRecent] = useState<RecentSend[]>([]);

  useEffect(() => {
    setRecent(loadRecent());
    fetchAdminUsers()
      .then((list) => setUsers(list.filter((u) => u.role?.toLowerCase() === 'user')))
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, userQuery]);

  const selectedUser = users.find((u) => u.id === userId) ?? null;
  const recipientCount = mode === 'all' ? users.length : selectedUser ? 1 : 0;

  const previewTitle = title.trim() || t('notifTitlePlaceholder');
  const previewBody = body.trim() || t('notifMessagePlaceholder');

  const canSend =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    (mode === 'all' || userId != null);

  const performSend = async () => {
    setSending(true);
    try {
      const result = await sendAdminUserNotification({
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || undefined,
        ...(mode === 'all' ? { allUsers: true } : { userId: userId! }),
      });
      showToast(formatVars(t('notifSentSuccess'), { count: result.sent }), 'success');
      const entry: RecentSend = {
        title: title.trim(),
        body: body.trim(),
        sent: result.sent,
        at: new Date().toISOString(),
      };
      saveRecent(entry);
      setRecent(loadRecent());
      setTitle('');
      setBody('');
      setUrl('');
      setUserQuery('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Send failed', 'error');
    } finally {
      setSending(false);
      setConfirmOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      showToast(t('notifTitleRequired'), 'error');
      return;
    }
    if (mode === 'user' && userId == null) {
      showToast(t('notifSelectUser'), 'error');
      return;
    }
    if (mode === 'all' && users.length > 0) {
      setConfirmOpen(true);
      return;
    }
    void performSend();
  };

  return (
    <AdminLayout>
      <div className="admin-notify-page">
        <header className="admin-notify-header">
          <div>
            <h1 className="page-title admin-notify-title">{t('sendNotificationsTitle')}</h1>
            <p className="admin-notify-desc">{t('sendNotificationsDesc')}</p>
          </div>
          <div className="admin-notify-stat-pill">
            <span className="admin-notify-stat-icon">👥</span>
            <span>
              <strong>{usersLoading ? '…' : users.length}</strong>
              <small>{t('users')}</small>
            </span>
          </div>
        </header>

        <div className="admin-notify-grid">
          <form className="card admin-notify-form" onSubmit={handleSubmit}>
            <section className="admin-notify-section">
              <h2 className="admin-notify-section-title">✏️ {t('notifTitleLabel')} & {t('notifMessageLabel')}</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="notif-title">{t('notifTitleLabel')}</label>
                <input
                  id="notif-title"
                  className="form-input"
                  placeholder={t('notifTitlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
                <span className="admin-notify-char">{title.length}/120</span>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="notif-body">{t('notifMessageLabel')}</label>
                <textarea
                  id="notif-body"
                  className="form-input"
                  rows={5}
                  placeholder={t('notifMessagePlaceholder')}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={500}
                />
                <span className="admin-notify-char">{body.length}/500</span>
              </div>
            </section>

            <section className="admin-notify-section">
              <h2 className="admin-notify-section-title">🔗 {t('notifLinkLabel')}</h2>
              <p className="admin-notify-hint">{t('notifLinkHint')}</p>
              <input
                className="form-input"
                placeholder="/events"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <div className="admin-notify-quick-links">
                <span className="admin-notify-quick-label">{t('notifQuickLinks')}:</span>
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.url}
                    type="button"
                    className={`chip ${url === link.url ? 'active' : ''}`}
                    onClick={() => setUrl(link.url)}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="admin-notify-section">
              <h2 className="admin-notify-section-title">📬 {t('notifRecipientLabel')}</h2>
              <div className="admin-notify-recipient-grid">
                <button
                  type="button"
                  className={`admin-notify-recipient-card ${mode === 'all' ? 'active' : ''}`}
                  onClick={() => { setMode('all'); setUserId(null); }}
                >
                  <span className="admin-notify-recipient-icon">📣</span>
                  <span className="admin-notify-recipient-name">{t('notifRecipientAll')}</span>
                  <span className="admin-notify-recipient-desc">{t('notifRecipientAllDesc')}</span>
                </button>
                <button
                  type="button"
                  className={`admin-notify-recipient-card ${mode === 'user' ? 'active' : ''}`}
                  onClick={() => setMode('user')}
                >
                  <span className="admin-notify-recipient-icon">👤</span>
                  <span className="admin-notify-recipient-name">{t('notifRecipientOne')}</span>
                  <span className="admin-notify-recipient-desc">{t('notifRecipientOneDesc')}</span>
                </button>
              </div>

              {mode === 'user' && (
                <div className="admin-notify-user-picker">
                  <input
                    type="search"
                    className="form-input"
                    placeholder={t('notifSearchUser')}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                  />
                  <div className="admin-notify-user-list" role="listbox">
                    {usersLoading ? (
                      <p className="admin-notify-hint">{t('notifLoadingUsers')}</p>
                    ) : filteredUsers.length === 0 ? (
                      <p className="admin-notify-hint">{t('notifNoUsersMatch')}</p>
                    ) : (
                      filteredUsers.slice(0, 50).map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          role="option"
                          aria-selected={userId === u.id}
                          className={`admin-notify-user-row ${userId === u.id ? 'selected' : ''}`}
                          onClick={() => setUserId(u.id)}
                        >
                          <span className="admin-notify-user-avatar">{u.username[0]?.toUpperCase() ?? 'U'}</span>
                          <span className="admin-notify-user-meta">
                            <strong>{u.username}</strong>
                            <small>{u.email}</small>
                          </span>
                          {userId === u.id && <span className="admin-notify-user-check">✓</span>}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </section>

            <div className="admin-notify-footer">
              <p className="admin-notify-recipient-summary">
                {recipientCount === 1
                  ? t('notifOneRecipient')
                  : formatVars(t('notifRecipientsCount'), { count: recipientCount })}
              </p>
              <button type="submit" className="btn btn-primary btn-full admin-notify-submit" disabled={sending || !canSend}>
                {sending ? t('saving') : `📤 ${t('notifSendBtn')}`}
              </button>
            </div>
          </form>

          <aside className="admin-notify-aside">
            <div className="card admin-notify-preview-card">
              <h2 className="admin-notify-section-title">{t('notifPreview')}</h2>
              <p className="admin-notify-hint">{t('notifPreviewHint')}</p>
              <div className="admin-notify-preview-shell">
                <div className="admin-notify-preview-bell">🔔 Notifications</div>
                <div className="admin-notify-preview-item">
                  <span className="admin-notify-preview-icon">{notificationIcon('admin')}</span>
                  <div className="admin-notify-preview-body">
                    <strong>{previewTitle}</strong>
                    <p>{previewBody}</p>
                    {url.trim() && <span className="admin-notify-preview-link">→ {url.trim()}</span>}
                  </div>
                  <span className="admin-notify-preview-dot" />
                </div>
              </div>
            </div>

            {recent.length > 0 && (
              <div className="card admin-notify-recent-card">
                <h2 className="admin-notify-section-title">{t('notifRecentSends')}</h2>
                <ul className="admin-notify-recent-list">
                  {recent.map((item, i) => (
                    <li key={`${item.at}-${i}`} className="admin-notify-recent-item">
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                      </div>
                      <span className="admin-notify-recent-meta">
                        {item.sent} · {new Date(item.at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={t('notifConfirmBroadcast')}
        message={formatVars(t('notifConfirmBroadcastMsg'), { count: users.length })}
        confirmLabel={t('notifSendBtn')}
        cancelLabel={t('cancel')}
        danger
        onConfirm={() => void performSend()}
        onCancel={() => setConfirmOpen(false)}
      />
    </AdminLayout>
  );
}

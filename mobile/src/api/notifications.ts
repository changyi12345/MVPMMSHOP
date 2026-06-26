import { apiFetch } from './client';

export interface UserNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  url: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export function fetchUserNotifications(opts?: { limit?: number; unreadOnly?: boolean }) {
  const params = new URLSearchParams();
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.unreadOnly) params.set('unreadOnly', 'true');
  const q = params.toString();
  return apiFetch<UserNotification[]>(`/notifications${q ? `?${q}` : ''}`);
}

export function fetchUnreadNotificationCount() {
  return apiFetch<{ count: number }>('/notifications/unread-count');
}

export function markNotificationRead(id: number) {
  return apiFetch<UserNotification>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead() {
  return apiFetch<{ updated: number }>('/notifications/read-all', { method: 'POST' });
}

export function notificationIcon(type: string): string {
  switch (type) {
    case 'order':
      return '📦';
    case 'wallet':
      return '💰';
    case 'refund':
      return '↩️';
    case 'admin':
      return '📣';
    case 'promo':
      return '🏷️';
    default:
      return '🔔';
  }
}

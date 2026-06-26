'use client';

import { useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import { fetchActivityLogs, ActivityLog } from '@/lib/api/admin';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';

function formatAction(action: string) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminActivityPage() {
  const { t } = useAdminLang();
  const loader = useCallback(() => fetchActivityLogs(150), []);
  const { data: logs, loading, error, reload } = useAdminLoad<ActivityLog[]>(loader, []);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('activity')} ({logs.length})</h1>
        <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
      </div>
      <p style={{ color: 'var(--dark-gray)', marginBottom: 16 }}>Recent admin actions across orders, wallet, users, and settings</p>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      <div className="card">
        {logs.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p className="empty-text">No activity logged yet</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ fontWeight: 500 }}>{formatAction(log.action)}</td>
                    <td>
                      {log.entity ? (
                        <span>{log.entity}{log.entityId ? ` #${log.entityId}` : ''}</span>
                      ) : '—'}
                    </td>
                    <td style={{ color: 'var(--dark-gray)', maxWidth: 360 }}>{log.detail ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

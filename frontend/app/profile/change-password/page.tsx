'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { changePassword, getStoredUser, logout } from '@/lib/api/auth';
import { useToast } from '@/components/Toast';
import { useLang } from '@/lib/useLang';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLang();
  const user = getStoredUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <PageLayout>
        <div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <p className="empty-text">{t('profileLoginRequired')}</p>
            <Link href="/auth/login" className="btn btn-primary">{t('login')}</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast(t('passwordMismatch'), 'error');
      return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      showToast(t('passwordUpdated'), 'success');
      logout();
      router.push('/auth/login');
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('networkError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="container" style={{ maxWidth: 500 }}>
        <Link href="/profile" style={{ fontSize: 14, color: 'var(--dark-gray)' }}>← {t('backToProfile')}</Link>
        <h1 className="page-title">{t('changePassword')}</h1>
        <div className="card" style={{ padding: 24 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="cur">{t('currentPassword')}</label>
              <input id="cur" type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new">{t('newPassword')}</label>
              <input id="new" type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="conf">{t('confirmPassword')}</label>
              <input id="conf" type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? t('updating') : t('updatePassword')}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}

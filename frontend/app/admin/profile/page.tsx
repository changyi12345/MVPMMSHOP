'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  changePassword,
  fetchProfile,
  getStoredUser,
  logout,
  refreshStoredUser,
  updateProfile,
} from '@/lib/api/auth';
import {
  disable2fa,
  enable2fa,
  fetch2faStatus,
  setup2fa,
} from '@/lib/api/admin';
import { enableWebPush, disableWebPush } from '@/lib/api/push';
import { useToast } from '@/components/Toast';
import { useAdminLang } from '@/lib/useAdminLang';

export default function AdminProfilePage() {
  const { t } = useAdminLang();
  const router = useRouter();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [setupData, setSetupData] = useState<{ otpauthUrl: string; secret: string } | null>(null);
  const [enableCode, setEnableCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    Promise.all([fetchProfile(), fetch2faStatus()])
      .then(([user, tfa]) => {
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        setTwoFaEnabled(tfa.enabled);
        refreshStoredUser(user);
      })
      .catch(() => showToast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await updateProfile({ username: username.trim(), email: email.trim() });
      refreshStoredUser(updated);
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Password change failed', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleSetup2FA = async () => {
    try {
      const data = await setup2fa();
      setSetupData(data);
      setBackupCodes(null);
      showToast('Scan QR code with Google Authenticator', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Setup failed', 'error');
    }
  };

  const handleEnable2FA = async () => {
    try {
      const result = await enable2fa(enableCode.trim());
      setTwoFaEnabled(true);
      setSetupData(null);
      setEnableCode('');
      setBackupCodes(result.backupCodes);
      showToast('2FA enabled', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Enable failed', 'error');
    }
  };

  const handleDisable2FA = async () => {
    try {
      await disable2fa(disablePassword, disableCode.trim());
      setTwoFaEnabled(false);
      setDisablePassword('');
      setDisableCode('');
      setSetupData(null);
      setBackupCodes(null);
      showToast('2FA disabled', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Disable failed', 'error');
    }
  };

  const handleTogglePush = async () => {
    try {
      if (pushEnabled) {
        await disableWebPush();
        setPushEnabled(false);
        showToast('Push notifications disabled', 'success');
      } else {
        const result = await enableWebPush();
        if (result === 'granted') {
          setPushEnabled(true);
          showToast('Push notifications enabled', 'success');
        } else if (result === 'unconfigured') {
          showToast('Push not configured on server (VAPID keys)', 'error');
        } else {
          showToast('Notification permission denied', 'error');
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Push setup failed', 'error');
    }
  };

  const stored = getStoredUser();
  const qrUrl = setupData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.otpauthUrl)}`
    : null;

  return (
    <AdminLayout>
      <h1 className="page-title">{t('adminProfile')}</h1>
      <p style={{ color: 'var(--dark-gray)', marginBottom: 24 }}>{t('manageAccount')}</p>

      {loading ? (
        <p style={{ color: 'var(--dark-gray)' }}>{t('loading')}</p>
      ) : (
        <div style={{ display: 'grid', gap: 24, maxWidth: 560 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">👤 {t('accountInfo')}</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-user">Username</label>
              <input id="prof-user" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-email">Email</label>
              <input id="prof-email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--dark-gray)', marginBottom: 16 }}>
              Role: <strong>{role.toUpperCase()}</strong>
              {stored?.id ? ` · ID #${stored.id}` : ''}
            </p>
            <button type="button" className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">🔒 {t('changePassword')}</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="cur-pass">Current Password</label>
              <input id="cur-pass" type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-pass">New Password</label>
              <input id="new-pass" type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="conf-pass">Confirm New Password</label>
              <input id="conf-pass" type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">🔐 Two-Factor Authentication</h2>
            <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>
              Status: <strong>{twoFaEnabled ? 'Enabled' : 'Disabled'}</strong>
            </p>
            {!twoFaEnabled && !setupData && (
              <button type="button" className="btn btn-secondary" onClick={handleSetup2FA}>
                Set up 2FA
              </button>
            )}
            {setupData && !twoFaEnabled && (
              <div>
                {qrUrl && (
                  <img src={qrUrl} alt="2FA QR code" width={200} height={200} style={{ display: 'block', marginBottom: 12 }} />
                )}
                <p style={{ fontSize: 12, color: 'var(--dark-gray)', marginBottom: 12, wordBreak: 'break-all' }}>
                  Secret: {setupData.secret}
                </p>
                <div className="form-group">
                  <label className="form-label">Verification code</label>
                  <input className="form-input" value={enableCode} onChange={(e) => setEnableCode(e.target.value)} placeholder="123456" />
                </div>
                <button type="button" className="btn btn-primary" onClick={handleEnable2FA}>
                  Enable 2FA
                </button>
              </div>
            )}
            {backupCodes && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--gray)', borderRadius: 8 }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Save these backup codes:</p>
                {backupCodes.map((c) => (
                  <code key={c} style={{ display: 'block', marginBottom: 4 }}>{c}</code>
                ))}
              </div>
            )}
            {twoFaEnabled && (
              <div style={{ marginTop: 8 }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Authenticator or backup code</label>
                  <input className="form-input" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} />
                </div>
                <button type="button" className="btn btn-outline" onClick={handleDisable2FA}>
                  Disable 2FA
                </button>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">🔔 Push Notifications</h2>
            <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>
              Get browser alerts for new orders and wallet top-ups.
            </p>
            <button type="button" className="btn btn-secondary" onClick={handleTogglePush}>
              {pushEnabled ? 'Disable Push' : 'Enable Push'}
            </button>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">🚪 {t('session')}</h2>
            <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>
              Sign out from the admin panel on this device.
            </p>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

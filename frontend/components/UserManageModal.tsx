'use client';

import { useEffect, useState } from 'react';
import { AdminUser } from '@/lib/api/admin';
import { formatPrice } from '@/lib/mock-data';

interface UserManageModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onSaveRole: (userId: number, role: string) => Promise<void>;
  onSaveWallet: (userId: number, amount: number, note: string) => Promise<void>;
  onViewOrders: (user: AdminUser) => void;
}

export default function UserManageModal({
  user,
  onClose,
  onSaveRole,
  onSaveWallet,
  onViewOrders,
}: UserManageModalProps) {
  const [role, setRole] = useState(user?.role ?? 'USER');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletNote, setWalletNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setWalletAmount('');
      setWalletNote('');
    }
  }, [user]);

  if (!user) return null;

  const handleRoleSave = async () => {
    setSaving(true);
    try {
      await onSaveRole(user.id, role);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleWalletSave = async () => {
    const amount = Number(walletAmount);
    if (!Number.isFinite(amount) || amount === 0) return;
    setSaving(true);
    try {
      await onSaveWallet(user.id, amount, walletNote);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="modal-title">Manage User — {user.username}</h2>
        <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>{user.email}</p>
        <p style={{ marginBottom: 16 }}><strong>Wallet:</strong> {formatPrice(Number(user.walletBalance))}</p>

        <div className="form-group">
          <label className="form-label" htmlFor="user-role">Role</label>
          <select id="user-role" className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <button type="button" className="btn btn-blue btn-sm" style={{ marginBottom: 20 }} disabled={saving} onClick={handleRoleSave}>
          Save Role
        </button>

        <div className="form-group">
          <label className="form-label" htmlFor="wallet-adjust">Wallet Adjust (MMK)</label>
          <input
            id="wallet-adjust"
            type="number"
            className="form-input"
            placeholder="+5000 or -2000"
            value={walletAmount}
            onChange={(e) => setWalletAmount(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="wallet-note">Note</label>
          <input id="wallet-note" className="form-input" value={walletNote} onChange={(e) => setWalletNote(e.target.value)} />
        </div>
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }} disabled={saving} onClick={handleWalletSave}>
          Apply Wallet Change
        </button>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={() => onViewOrders(user)}>View Orders</button>
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

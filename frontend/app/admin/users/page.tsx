'use client';

import { useCallback, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import ConfirmModal from '@/components/ConfirmModal';
import UserManageModal from '@/components/UserManageModal';
import StatusBadge from '@/components/StatusBadge';
import {
  fetchAdminUsers,
  fetchUserOrders,
  updateUserRole,
  adjustUserWallet,
  AdminUser,
  UserOrderSummary,
} from '@/lib/api/admin';
import { formatPrice } from '@/lib/mock-data';
import { formatOrderId } from '@/lib/api/orders';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';
import { useToast } from '@/components/Toast';

export default function AdminUsers() {
  const { t } = useAdminLang();
  const loader = useCallback(() => fetchAdminUsers(), []);
  const { data: users, loading, error, reload } = useAdminLoad<AdminUser[]>(loader, []);
  const [search, setSearch] = useState('');
  const [manageUser, setManageUser] = useState<AdminUser | null>(null);
  const [ordersUser, setOrdersUser] = useState<AdminUser | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  const handleSaveRole = async (userId: number, role: string) => {
    await updateUserRole(userId, role);
    showToast('Role updated', 'success');
    await reload();
  };

  const handleSaveWallet = async (userId: number, amount: number, note: string) => {
    await adjustUserWallet(userId, amount, note);
    showToast('Wallet updated', 'success');
    await reload();
  };

  const handleViewOrders = async (user: AdminUser) => {
    setManageUser(null);
    setOrdersUser(user);
    setOrdersLoading(true);
    try {
      setUserOrders(await fetchUserOrders(user.id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('usersTitle')} ({users.length})</h1>
        <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
      </div>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      <input
        type="search"
        className="search-bar"
        placeholder="🔍 Search username, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <div className="card">
        {filtered.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p className="empty-text">No users found</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Wallet</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-red' : 'badge-blue'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{formatPrice(Number(user.walletBalance))}</td>
                    <td>{user._count?.orders ?? 0}</td>
                    <td>{user.createdAt.slice(0, 10)}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn-blue btn-sm" onClick={() => setManageUser(user)}>
                          Manage
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => handleViewOrders(user)}>
                          Orders
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserManageModal
        user={manageUser}
        onClose={() => setManageUser(null)}
        onSaveRole={handleSaveRole}
        onSaveWallet={handleSaveWallet}
        onViewOrders={handleViewOrders}
      />

      {ordersUser && (
        <div className="modal-overlay" onClick={() => setOrdersUser(null)} role="presentation">
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="modal-title">Orders — {ordersUser.username}</h2>
            {ordersLoading ? (
              <p style={{ color: 'var(--dark-gray)', padding: '16px 0' }}>Loading...</p>
            ) : userOrders.length === 0 ? (
              <p style={{ color: 'var(--dark-gray)', padding: '16px 0' }}>No orders yet</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Product</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((o) => (
                      <tr key={o.id}>
                        <td>{formatOrderId(o.id)}</td>
                        <td>{o.productName}</td>
                        <td>{formatPrice(o.totalPrice)}</td>
                        <td><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button type="button" className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => setOrdersUser(null)}>Close</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

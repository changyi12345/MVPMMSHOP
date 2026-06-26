'use client';

import { useCallback, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import ConfirmModal from '@/components/ConfirmModal';
import PromoFormModal, { PromoFormData } from '@/components/PromoFormModal';
import { useToast } from '@/components/Toast';
import { fetchPromos, createPromo, updatePromo, deletePromo, PromoCode } from '@/lib/api/promos';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';

export default function AdminPromos() {
  const { t } = useAdminLang();
  const loader = useCallback(() => fetchPromos(), []);
  const { data: promos, loading, error, reload } = useAdminLoad<PromoCode[]>(loader, []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { showToast } = useToast();

  const handleSave = async (data: PromoFormData) => {
    try {
      if (editing) {
        await updatePromo(editing.id, data);
        showToast(`Promo ${data.code} updated`, 'success');
      } else {
        await createPromo(data);
        showToast(`Promo ${data.code} created`, 'success');
      }
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    }
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await deletePromo(deleteId);
      showToast('Promo deleted', 'warning');
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('promosTitle')} ({promos.length})</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            {t('addNewPromo')}
          </button>
        </div>
      </div>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      <div className="card">
        {promos.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <p className="empty-text">No promo codes yet</p>
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setFormOpen(true); }}>
              Create Promo
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Usage</th>
                  <th>Valid From</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => (
                  <tr key={promo.id}>
                    <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>{promo.code}</td>
                    <td>{promo.discountPercent}%</td>
                    <td>{promo.usageCount} / {promo.maxUsage}</td>
                    <td>{promo.validFrom.slice(0, 10)}</td>
                    <td>{promo.validUntil.slice(0, 10)}</td>
                    <td>
                      <span className={`badge ${promo.isActive ? 'badge-blue' : 'badge-gray'}`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn-blue btn-sm" onClick={() => { setEditing(promo); setFormOpen(true); }}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => setDeleteId(promo.id)}>
                          Delete
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

      <PromoFormModal
        open={formOpen}
        initial={editing ? {
          code: editing.code,
          discountPercent: editing.discountPercent,
          maxUsage: editing.maxUsage,
          validFrom: editing.validFrom.slice(0, 10),
          validUntil: editing.validUntil.slice(0, 10),
          isActive: editing.isActive,
        } : null}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
      />

      <ConfirmModal
        open={deleteId != null}
        title="Delete Promo Code?"
        message="This promo code will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}

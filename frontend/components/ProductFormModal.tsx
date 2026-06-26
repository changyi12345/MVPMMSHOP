'use client';

import { useEffect, useState } from 'react';

export interface ProductFormData {
  name: string;
  type: string;
  unitPrice: number;
  stock: number;
  isActive: boolean;
  g2bulkGameCode: string;
  description: string;
}

interface ProductFormModalProps {
  open: boolean;
  initial?: (ProductFormData & { id?: number | null }) | null;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
}

const emptyForm: ProductFormData = {
  name: '',
  type: 'direct_topup',
  unitPrice: 0,
  stock: 100,
  isActive: true,
  g2bulkGameCode: '',
  description: '',
};

export default function ProductFormModal({ open, initial, onClose, onSave }: ProductFormModalProps) {
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        name: initial.name,
        type: initial.type,
        unitPrice: initial.unitPrice,
        stock: initial.stock,
        isActive: initial.isActive,
        g2bulkGameCode: initial.g2bulkGameCode ?? '',
        description: initial.description ?? '',
      } : emptyForm);
      setShowAdvanced(Boolean(initial?.g2bulkGameCode || initial?.description));
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.unitPrice <= 0) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="modal-title">{initial?.id ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-name">Name</label>
            <input id="prod-name" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-type">Type</label>
            <select id="prod-type" className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="direct_topup">Direct Top-Up</option>
              <option value="voucher">Voucher</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-price">Price (MMK)</label>
              <input id="prod-price" type="number" min={1} className="form-input" value={form.unitPrice || ''} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-stock">Stock</label>
              <input id="prod-stock" type="number" min={0} className="form-input" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginBottom: 12 }}
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? '▾ Hide advanced' : '▸ Advanced options'}
          </button>
          {showAdvanced && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-code">G2Bulk Game Code</label>
                <input id="prod-code" className="form-input" value={form.g2bulkGameCode} onChange={(e) => setForm({ ...form, g2bulkGameCode: e.target.value })} placeholder="mlbb, pubgm, etc." />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-desc">Description</label>
                <textarea id="prod-desc" className="form-textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

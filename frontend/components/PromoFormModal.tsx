'use client';

import { useEffect, useState } from 'react';

export interface PromoFormData {
  code: string;
  discountPercent: number;
  maxUsage: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface PromoFormModalProps {
  open: boolean;
  initial?: PromoFormData | null;
  onClose: () => void;
  onSave: (data: PromoFormData) => void;
}

const emptyForm: PromoFormData = {
  code: '',
  discountPercent: 10,
  maxUsage: 100,
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: '',
  isActive: true,
};

export default function PromoFormModal({ open, initial, onClose, onSave }: PromoFormModalProps) {
  const [form, setForm] = useState<PromoFormData>(emptyForm);

  useEffect(() => {
    if (open) setForm(initial ?? emptyForm);
  }, [open, initial]);

  if (!open) return null;

  const generateCode = () => {
    const code = `SAVE${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setForm((f) => ({ ...f, code }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.validUntil) return;
    onSave({ ...form, code: form.code.trim().toUpperCase() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-form-title"
      >
        <h2 id="promo-form-title" className="modal-title">
          {initial ? 'Edit Promo Code' : 'Create Promo Code'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="promo-code">Code</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="promo-code"
                type="text"
                className="form-input"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME10"
                required
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={generateCode}>
                Auto
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="promo-discount">Discount (%)</label>
            <input
              id="promo-discount"
              type="number"
              className="form-input"
              min={1}
              max={100}
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="promo-max">Max Usage</label>
            <input
              id="promo-max"
              type="number"
              className="form-input"
              min={1}
              value={form.maxUsage}
              onChange={(e) => setForm({ ...form, maxUsage: Number(e.target.value) })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="promo-from">Valid From</label>
              <input
                id="promo-from"
                type="date"
                className="form-input"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="promo-until">Valid Until</label>
              <input
                id="promo-until"
                type="date"
                className="form-input"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                required
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
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

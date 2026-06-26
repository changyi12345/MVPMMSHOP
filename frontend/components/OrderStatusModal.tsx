'use client';

import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

const STATUSES = ['PENDING', 'PAYMENT_PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

interface OrderStatusModalProps {
  open: boolean;
  orderId: number | null;
  currentStatus: string;
  onClose: () => void;
  onSave: (orderId: number, status: string) => void;
}

export default function OrderStatusModal({ open, orderId, currentStatus, onClose, onSave }: OrderStatusModalProps) {
  const [status, setStatus] = useState(currentStatus);

  if (!open || orderId == null) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="modal-title">Update Order Status</h2>
        <p className="modal-message">Order #{orderId}</p>
        <div className="form-group">
          <label className="form-label" htmlFor="order-status">Status</label>
          <select
            id="order-status"
            className="form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { onSave(orderId, status); onClose(); }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

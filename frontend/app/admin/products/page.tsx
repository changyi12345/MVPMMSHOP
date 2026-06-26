'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminDataState from '@/components/AdminDataState';
import ConfirmModal from '@/components/ConfirmModal';
import ProductFormModal, { ProductFormData } from '@/components/ProductFormModal';
import { useToast } from '@/components/Toast';
import { formatProductPrice, productKey, stockLabel } from '@/lib/admin-products';
import {
  fetchAdminProducts,
  fetchExchangeSettings,
  updateExchangeSettings,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  AdminProduct,
  ExchangeSettings,
} from '@/lib/api/admin';
import { useAdminLoad } from '@/lib/useAdminLoad';
import { useAdminLang } from '@/lib/useAdminLang';

const PAGE_SIZE = 50;

type TypeFilter = 'all' | 'direct_topup' | 'voucher';

export default function AdminProducts() {
  const { t } = useAdminLang();
  const loader = useCallback(() => fetchAdminProducts(), []);
  const { data: products, loading, error, reload } = useAdminLoad<AdminProduct[]>(loader, []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<(ProductFormData & { id?: number | null }) | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [page, setPage] = useState(1);
  const [exchange, setExchange] = useState<ExchangeSettings | null>(null);
  const [rateInput, setRateInput] = useState('');
  const [markupInput, setMarkupInput] = useState('');
  const [savingRate, setSavingRate] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchExchangeSettings()
      .then((s) => {
        setExchange(s);
        setRateInput(String(s.usdToMmkRate));
        setMarkupInput(String(s.priceMarkupPercent));
      })
      .catch(() => {
        // settings load failed — defaults shown on save retry
      });
  }, []);

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!showHidden && !p.isActive) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.typeLabel.toLowerCase().includes(q) ||
        (p.g2bulkGameCode ?? '').toLowerCase().includes(q) ||
        (p.categoryTitle ?? '').toLowerCase().includes(q)
      );
    });
  }, [products, search, showHidden, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const pagedProducts = visibleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, showHidden, typeFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const hiddenCount = useMemo(() => products.filter((p) => !p.isActive).length, [products]);
  const gameCount = useMemo(() => products.filter((p) => p.type === 'direct_topup').length, [products]);
  const voucherCount = useMemo(() => products.filter((p) => p.type === 'voucher').length, [products]);

  const handleSave = async (data: ProductFormData) => {
    try {
      if (editing?.id) {
        await updateProduct(editing.id, data);
        showToast('Product updated', 'success');
      } else {
        await createProduct(data);
        showToast('Product saved', 'success');
      }
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    }
    setEditing(null);
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      await toggleProductActive({
        id: product.id ?? undefined,
        g2bulkGameCode: product.g2bulkGameCode ?? undefined,
        g2bulkProductId: product.g2bulkProductId ?? undefined,
      });
      showToast(product.isActive ? 'Product hidden' : 'Product shown', 'success');
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteProduct(deleteId);
      showToast('Product deleted', 'warning');
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
    setDeleteId(null);
  };

  const handleSaveExchange = async () => {
    const usdToMmkRate = Number(rateInput);
    const priceMarkupPercent = Number(markupInput);
    if (!Number.isFinite(usdToMmkRate) || usdToMmkRate <= 0) {
      showToast('Enter a valid MMK rate', 'error');
      return;
    }
    setSavingRate(true);
    try {
      const updated = await updateExchangeSettings({ usdToMmkRate, priceMarkupPercent });
      setExchange(updated);
      showToast('Exchange rate updated — prices recalculated', 'success');
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSavingRate(false);
    }
  };

  const exampleUsd = 10;
  const exampleMmk = exchange
    ? Math.round(exampleUsd * exchange.usdToMmkRate * (1 + exchange.priceMarkupPercent / 100))
    : null;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            {t('products')} ({products.length.toLocaleString()})
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            {t('g2bulkCatalog')} — {gameCount} {t('games')} · {voucherCount} {t('voucherType')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={reload}>↻ {t('refresh')}</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            {t('addCustomProduct')}
          </button>
        </div>
      </div>

      <AdminDataState loading={loading} error={error} onRetry={reload} />

      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>💱 {t('exchangeRateTitle')}</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          G2Bulk API ဈေးများ USD ဖြစ်ပါတယ် — rate ပြောင်းရင် voucher/gift card ဈေးတွေ MMK အလိုက် auto ပြန်တွက်ပါမယ်
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label className="form-label" htmlFor="usd-mmk-rate">1 USD = MMK</label>
            <input
              id="usd-mmk-rate"
              type="number"
              min={1}
              className="form-input"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 120 }}>
            <label className="form-label" htmlFor="price-markup">{t('markupPercent')}</label>
            <input
              id="price-markup"
              type="number"
              min={0}
              max={100}
              step={0.1}
              className="form-input"
              value={markupInput}
              onChange={(e) => setMarkupInput(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveExchange}
            disabled={savingRate}
          >
            {savingRate ? t('saving') : t('saveRate')}
          </button>
        </div>
        {exampleMmk != null && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, marginBottom: 0 }}>
            Example: ${exampleUsd} USD → Ks {exampleMmk.toLocaleString()} MMK
            {exchange && exchange.priceMarkupPercent > 0 ? ` (incl. ${exchange.priceMarkupPercent}% markup)` : ''}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          className="form-input"
          placeholder={t('searchProductsPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320, flex: '1 1 220px' }}
        />
        <select
          className="form-input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="all">{t('allTypes')}</option>
          <option value="direct_topup">{t('directTopup')} ({gameCount})</option>
          <option value="voucher">{t('voucherType')} ({voucherCount})</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
          />
          {t('showHiddenCount')} ({hiddenCount})
        </label>
      </div>

      <div className="card">
        {visibleProducts.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">🎮</div>
            <p className="empty-text">
              {products.length === 0
                ? t('noProductsLoad')
                : t('noProductsMatch')}
            </p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>{t('image')}</th>
                    <th>{t('productName')}</th>
                    <th>{t('type')}</th>
                    <th>{t('priceMmk')}</th>
                    <th>{t('stock')}</th>
                    <th>{t('status')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                {pagedProducts.map((product) => {
                  const stock = stockLabel(product.stock);
                  const price = formatProductPrice(product);
                  return (
                      <tr key={productKey(product)} style={!product.isActive ? { opacity: 0.65 } : undefined}>
                        <td>
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={40}
                              height={40}
                              unoptimized
                              style={{ borderRadius: 8, objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                background: 'var(--surface-2, #1e293b)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                              }}
                              aria-hidden
                            >
                              {product.type === 'voucher' ? '🎫' : '🎮'}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{product.name}</div>
                          {product.categoryTitle && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              {product.categoryTitle}
                            </div>
                          )}
                          {product.g2bulkGameCode && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              {product.g2bulkGameCode}
                            </div>
                          )}
                        </td>
                        <td>{product.typeLabel}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{price.primary}</div>
                          {price.secondary && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              {price.secondary}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${stock.className}`}>{stock.text}</span>
                          <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                            ({product.stock.toLocaleString()})
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${product.isActive ? 'badge-blue' : 'badge-gray'}`}>
                            {product.isActive ? t('active') : t('hidden')}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleToggleActive(product)}
                            >
                              {product.isActive ? 'Hide' : 'Show'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-blue btn-sm"
                              onClick={() => {
                                setEditing({
                                  id: product.id,
                                  name: product.name,
                                  type: product.type,
                                  unitPrice: product.unitPrice,
                                  stock: product.stock,
                                  isActive: product.isActive,
                                  g2bulkGameCode: product.g2bulkGameCode ?? '',
                                  description: product.description ?? '',
                                });
                                setFormOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            {product.id != null && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setDeleteId(product.id!)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visibleProducts.length)} of {visibleProducts.length.toLocaleString()}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Prev
                  </button>
                  <span style={{ alignSelf: 'center', fontSize: 14 }}>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ProductFormModal
        open={formOpen}
        initial={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
      />

      <ConfirmModal
        open={deleteId != null}
        title="Delete Product?"
        message="This local override will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}

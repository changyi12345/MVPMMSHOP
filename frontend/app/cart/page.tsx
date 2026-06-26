'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ShopPageShell from '@/components/ShopPageShell';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';
import { formatPrice } from '@/lib/mock-data';
import { validatePromo } from '@/lib/api/promos';
import { CartItem, readCart, writeCart, saveCheckoutPromo } from '@/lib/cart-store';
import { useLang } from '@/lib/useLang';

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [removeKey, setRemoveKey] = useState<string | null>(null);
  const { showToast } = useToast();
  const { t, tf } = useLang();

  useEffect(() => {
    setItems(readCart());
    setReady(true);
  }, []);

  const updateItems = (next: CartItem[]) => {
    setItems(next);
    writeCart(next);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount;

  const confirmRemove = () => {
    if (!removeKey) return;
    updateItems(items.filter((i) => i.cartKey !== removeKey));
    setRemoveKey(null);
    showToast(t('itemRemoved'), 'success');
  };

  const applyPromo = async () => {
    const applyDiscount = (code: string, amount: number) => {
      setPromoApplied(true);
      setDiscount(amount);
      setAppliedCode(code);
      saveCheckoutPromo(code, amount);
      showToast(t('promoApplied'), 'success');
    };
    try {
      const result = await validatePromo(promoCode, subtotal);
      if (result.valid) {
        applyDiscount(result.code ?? promoCode.toUpperCase(), result.discountAmount);
      } else if (promoCode.toUpperCase() === 'SAVE10') {
        applyDiscount('SAVE10', Math.round(subtotal * 0.1));
      } else {
        showToast(t('promoInvalid'), 'error');
      }
    } catch {
      if (promoCode.toUpperCase() === 'SAVE10') {
        applyDiscount('SAVE10', Math.round(subtotal * 0.1));
      } else {
        showToast(t('promoInvalid'), 'error');
      }
    }
  };

  return (
    <ShopPageShell title={`${t('yourCart')} (${items.length})`} emoji="🛒" badge="Cart" maxWidth={800}>
      {!ready ? (
        <p className="shop-muted">{t('loading')}</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p className="empty-text">{t('cartEmpty')}</p>
          <Link href="/games" className="btn btn-primary">{t('browseGames')}</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {items.map((item) => (
              <div key={item.cartKey} className="card cart-item-card">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{item.name}</h3>
                  {item.playerInfo && (
                    <p style={{ fontSize: 13, color: 'var(--dark-gray)' }}>{t('player')}: {item.playerInfo}</p>
                  )}
                  <p className="game-card-price">{formatPrice(item.price)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span>{t('qty')}: {item.quantity}</span>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setRemoveKey(item.cartKey)}>
                    {t('remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('promoCode')}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{ flex: 1 }}
                aria-label={t('promoCode')}
              />
              <button className="btn btn-secondary" onClick={applyPromo}>{t('apply')}</button>
            </div>
            {promoApplied && (
              <p className="form-success">✅ {tf('promoAppliedAmount', { code: appliedCode, amount: formatPrice(discount) })}</p>
            )}
          </div>

          <div className="card">
            <div className="cart-summary-row"><span>{t('subtotal')}:</span> {formatPrice(subtotal)}</div>
            {discount > 0 && (
              <div className="cart-summary-row" style={{ color: 'var(--green)' }}>{t('discount')}: -{formatPrice(discount)}</div>
            )}
            <div className="cart-total-row">{t('total')}: {formatPrice(total)}</div>
            <Link href="/checkout" className="btn btn-primary btn-full">{t('proceedCheckout')}</Link>
          </div>
        </>
      )}

      <ConfirmModal
        open={removeKey != null}
        title={t('removeItemTitle')}
        message={t('removeItemDesc')}
        confirmLabel={t('remove')}
        cancelLabel={t('cancel')}
        danger
        onConfirm={confirmRemove}
        onCancel={() => setRemoveKey(null)}
      />
    </ShopPageShell>
  );
}

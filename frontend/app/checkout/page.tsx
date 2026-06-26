'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShopPageShell from '@/components/ShopPageShell';
import { useToast } from '@/components/Toast';
import { formatPrice } from '@/lib/format-price';
import {
  readCart,
  clearCart,
  readCheckoutPromo,
  clearCheckoutPromo,
} from '@/lib/cart-store';
import { getStoredUser } from '@/lib/api/auth';
import {
  cartItemsToOrderPayload,
  createOrder,
  formatOrderId,
  resolvePrimaryOrderId,
  submitPaymentProof,
} from '@/lib/api/orders';
import { uploadPaymentProofImage } from '@/lib/api/upload';
import PaymentProofFilePicker from '@/components/PaymentProofFilePicker';
import { useLang } from '@/lib/useLang';
import { useWallet } from '@/lib/use-wallet';
import { useShop } from '@/components/ShopProvider';
import { trackBeginCheckout, trackPurchase } from '@/lib/analytics';

export default function Checkout() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLang();
  const user = getStoredUser();
  const { balance, reload: reloadWallet } = useWallet();
  const shop = useShop();

  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [reference, setReference] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [cartItems, setCartItems] = useState(readCart());
  const [promo] = useState(readCheckoutPromo);

  const shopName = shop?.shopName ?? 'MVPMMSHOP';
  const contactPhone = shop?.contactPhone ?? '—';
  const flags = shop?.featureFlags;
  const walletOn = flags?.walletEnabled !== false;

  const externalAccounts = (shop?.paymentAccounts?.length
    ? shop.paymentAccounts
    : (shop?.paymentMethods ?? ['KBZ Pay', 'Wave Pay', 'Bank Transfer']).map((name) => ({
        id: name.toLowerCase().includes('kbz') ? 'kbz' : name.toLowerCase().includes('wave') ? 'wave' : name.toLowerCase().includes('bank') ? 'bank' : name,
        name,
        accountNumber: shop?.contactPhone ?? '',
        accountHolder: shopName,
        enabled: true,
      }))
  ).filter((acc) => acc.enabled !== false);

  const paymentMethods = [
    ...(walletOn ? [{ id: 'wallet', name: t('walletBalancePay') }] : []),
    ...externalAccounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      account: acc.accountNumber || contactPhone,
      holder: acc.accountHolder || shopName,
    })),
  ];

  useEffect(() => {
    setCartItems(readCart());
  }, []);

  useEffect(() => {
    if (!walletOn && payment === 'wallet' && paymentMethods.length > 0) {
      setPayment(paymentMethods[0].id);
    }
  }, [walletOn, payment, paymentMethods]);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promo?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const canPayWithWallet = balance >= total;

  const placeOrder = async () => {
    if (!user) {
      showToast(t('pleaseLoginFirst'), 'error');
      router.push('/auth/login?redirect=/checkout');
      return null;
    }
    if (cartItems.length === 0) {
      showToast(t('cartEmpty') ?? 'Cart is empty', 'error');
      return null;
    }
    setLoading(true);
    try {
      const result = await createOrder({
        items: cartItemsToOrderPayload(cartItems),
        paymentMethod: payment,
        promoCode: promo?.code,
      });
      const id = resolvePrimaryOrderId(result);
      setOrderId(id);
      clearCart();
      clearCheckoutPromo();
      trackPurchase(id, total, payment);
      return id;
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('orderFailed'), 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleWalletPay = async () => {
    const id = await placeOrder();
    if (id) {
      await reloadWallet();
      router.push(`/orders/${id}`);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofFile) {
      showToast(t('uploadRequired'), 'error');
      return;
    }
    if (!reference.trim()) {
      showToast(t('referenceRequired'), 'error');
      return;
    }
    setLoading(true);
    try {
      let id = orderId;
      if (!id) id = await placeOrder();
      if (!id) return;
      const imageUrl = await uploadPaymentProofImage(proofFile);
      const method = paymentMethods.find((m) => m.id === payment)?.name ?? payment;
      await submitPaymentProof(id, { method, reference: reference.trim(), imageUrl });
      router.push(`/orders/${id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('submitFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderId) {
    return (
      <ShopPageShell title={t('checkout')} emoji="💳" badge="Checkout" maxWidth={500} centered>
        <div className="empty-state">
          <p className="empty-text">{t('cartEmpty') ?? 'Your cart is empty'}</p>
          <Link href="/games" className="btn btn-primary">{t('browseGames') ?? 'Browse Games'}</Link>
        </div>
      </ShopPageShell>
    );
  }

  if (orderId && payment === 'wallet') {
    return (
      <ShopPageShell title={t('orderPlaced')} emoji="✅" badge="Success" maxWidth={500} centered>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <p className="shop-muted" style={{ marginBottom: 8 }}>{t('orderId')}: <strong>{formatOrderId(orderId)}</strong></p>
          <Link href={`/orders/${orderId}`} className="btn btn-primary btn-full">{t('trackOrder')}</Link>
        </div>
      </ShopPageShell>
    );
  }

  return (
    <ShopPageShell title={t('checkout')} emoji="💳" badge="Checkout" maxWidth={700}>

        <div className="checkout-steps">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`checkout-step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
              {s === 1 ? t('reviewOrder') : s === 2 ? t('payment') : t('uploadProof')}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="card">
            <h2 className="section-title">{t('orderSummary')}</h2>
            {cartItems.map((item) => (
              <div key={item.cartKey} style={{ marginBottom: 12 }}>
                <p style={{ marginBottom: 4 }}>
                  <strong>{item.name}</strong> x{item.quantity} — {formatPrice(item.price * item.quantity)}
                </p>
                {item.playerInfo && (
                  <p style={{ fontSize: 13, color: 'var(--dark-gray)', margin: 0 }}>{item.playerInfo}</p>
                )}
              </div>
            ))}
            {discount > 0 && promo && (
              <p style={{ color: 'var(--green)' }}>
                {t('promoCode')}: {promo.code} (−{formatPrice(discount)})
              </p>
            )}
            <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, marginTop: 16 }}>{t('total')}: {formatPrice(total)}</p>
            <button type="button" className="btn btn-primary btn-full" onClick={() => {
              trackBeginCheckout(total, cartItems.length);
              setStep(2);
            }}>{t('continuePayment')} →</button>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2 className="section-title">{t('selectPayment')}</h2>
            {paymentMethods.map((m) => (
              <div
                key={m.id}
                className={`payment-option ${payment === m.id ? 'selected' : ''} ${m.id === 'wallet' && !canPayWithWallet ? 'disabled' : ''}`}
                onClick={() => {
                  if (m.id === 'wallet' && !canPayWithWallet) return;
                  setPayment(m.id);
                }}
              >
                <div className="payment-option-title">
                  {m.name}
                  {m.id === 'wallet' && !canPayWithWallet && (
                    <span style={{ color: 'var(--red)', fontSize: 13, marginLeft: 8 }}>{t('insufficientBalance')}</span>
                  )}
                </div>
                <div className="payment-option-detail">
                  {m.id === 'wallet'
                    ? `${t('balance')}: ${formatPrice(balance)}`
                    : 'account' in m && m.account
                      ? `${t('account')}: ${m.account} | ${'holder' in m ? m.holder : shopName}`
                      : m.name}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← {t('back')}</button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={loading || (payment === 'wallet' && !canPayWithWallet)}
                onClick={() => payment === 'wallet' ? handleWalletPay() : setStep(3)}
              >
                {loading ? t('processing') : payment === 'wallet' ? t('payWithWallet') : `${t('continueBtn')} →`}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <h2 className="section-title">{t('uploadPaymentProof')}</h2>
            <PaymentProofFilePicker file={proofFile} onFileChange={setProofFile} inputId="checkout-proof" />
            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">{t('transactionRef')}</label>
              <input type="text" className="form-input" placeholder={t('txnRefPlaceholder')} value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>← {t('back')}</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={loading} onClick={handleSubmitProof}>
                {loading ? t('submitting') : t('submitOrder')}
              </button>
            </div>
          </div>
        )}
    </ShopPageShell>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useToast } from '@/components/Toast';
import { formatPrice } from '@/lib/format-price';
import { useLang } from '@/lib/useLang';
import { useAuthUser } from '@/lib/use-auth';
import { useShop } from '@/components/ShopProvider';
import { fetchShopInfo, PublicShopInfo } from '@/lib/api/settings';
import { requestTopUp, WALLET_TOPUP_AMOUNTS } from '@/lib/api/wallet';
import { uploadPaymentProofImage } from '@/lib/api/upload';
import PaymentProofFilePicker from '@/components/PaymentProofFilePicker';
import { parseMmkAmount } from '@/lib/parse-mmk-amount';

function paymentId(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('kbz')) return 'kbz';
  if (lower.includes('wave')) return 'wave';
  if (lower.includes('bank')) return 'bank';
  return lower.replace(/\s+/g, '-');
}

export default function WalletTopUpPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLang();
  const shop = useShop();
  const { isLoggedIn, ready } = useAuthUser();

  const [shopInfo, setShopInfo] = useState<PublicShopInfo | null>(shop as PublicShopInfo | null);
  const [amount, setAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [payment, setPayment] = useState('');
  const [reference, setReference] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState(0);

  const minTopup = shopInfo?.minWalletTopup ?? 1000;
  const shopName = shopInfo?.shopName ?? 'MVPMMSHOP';
  const contactPhone = shopInfo?.contactPhone;

  const presetAmounts = useMemo(
    () => WALLET_TOPUP_AMOUNTS.filter((a) => a >= minTopup),
    [minTopup],
  );

  const paymentMethods = useMemo(() => {
    const accounts = shopInfo?.paymentAccounts?.length
      ? shopInfo.paymentAccounts
      : (shopInfo?.paymentMethods?.length
          ? shopInfo.paymentMethods
          : ['KBZ Pay', 'Wave Pay', 'Bank Transfer']
        ).map((name) => ({
          id: paymentId(name),
          name,
          accountNumber: contactPhone ?? '',
          accountHolder: shopName,
        }));
    return accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      account: acc.accountNumber || contactPhone || '—',
      holder: acc.accountHolder || shopName,
    }));
  }, [shopInfo, contactPhone, shopName]);

  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace('/auth/login?redirect=/wallet/topup');
    }
  }, [ready, isLoggedIn, router]);

  useEffect(() => {
    if (shop?.paymentMethods) {
      setShopInfo(shop as PublicShopInfo);
    } else {
      fetchShopInfo().then(setShopInfo).catch(() => {});
    }
  }, [shop]);

  useEffect(() => {
    if (paymentMethods.length && !payment) {
      setPayment(paymentMethods[0].id);
    }
  }, [paymentMethods, payment]);

  const selectedAmount = customAmount ? parseMmkAmount(customAmount) : amount;
  const selectedMethod = paymentMethods.find((m) => m.id === payment);

  const handleSubmit = async () => {
    if (!selectedAmount || selectedAmount < minTopup) {
      showToast(t('minAmountHint'), 'error');
      return;
    }
    if (!selectedMethod) {
      showToast(t('selectPayment'), 'error');
      return;
    }
    if (!proofFile) {
      showToast(t('uploadRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      const proofImageUrl = await uploadPaymentProofImage(proofFile);
      await requestTopUp(
        parseMmkAmount(selectedAmount),
        selectedMethod.name,
        reference.trim() || undefined,
        proofImageUrl,
      );
      setSubmittedAmount(parseMmkAmount(selectedAmount));
      setSubmitted(true);
      showToast(t('topUpRequested'), 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('submitFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!ready || !isLoggedIn) {
    return (
      <PageLayout>
        <div className="container" style={{ maxWidth: 640, textAlign: 'center' }}>
          <p>{t('loading')}</p>
        </div>
      </PageLayout>
    );
  }

  if (submitted) {
    return (
      <PageLayout>
        <div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
          <div className="card">
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h1 className="page-title">{t('topUpRequested')}</h1>
            <p style={{ color: 'var(--dark-gray)', marginBottom: 8 }}>
              {t('amount')}: <strong>{formatPrice(submittedAmount)}</strong>
            </p>
            <p style={{ marginBottom: 24 }}>{t('topUpVerifyWait')}</p>
            <Link href="/wallet" className="btn btn-primary btn-full">{t('backToWallet')}</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container" style={{ maxWidth: 640 }}>
        <Link href="/wallet" style={{ color: 'var(--dark-gray)', marginBottom: 24, display: 'inline-block' }}>
          ← {t('backToWallet')}
        </Link>
        <h1 className="page-title">{t('topUpWallet')}</h1>

        <div className="card" style={{ marginBottom: 24 }}>
          <h2 className="section-title">{t('selectAmount')}</h2>
          <div className="wallet-amount-grid">
            {presetAmounts.map((a) => (
              <button
                key={a}
                type="button"
                className={`wallet-amount-btn ${!customAmount && amount === a ? 'selected' : ''}`}
                onClick={() => { setAmount(a); setCustomAmount(''); }}
              >
                {formatPrice(a)}
              </button>
            ))}
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">{t('customAmount')}</label>
            <input
              type="text"
              inputMode="numeric"
              className="form-input"
              placeholder={t('minAmountHint')}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value.replace(/[^\d]/g, ''))}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h2 className="section-title">{t('paymentMethod')}</h2>
          {paymentMethods.map((m) => (
            <div
              key={m.id}
              className={`payment-option ${payment === m.id ? 'selected' : ''}`}
              onClick={() => setPayment(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setPayment(m.id)}
            >
              <div className="payment-option-title">{m.name}</div>
              <div className="payment-option-detail">
                {t('account')}: {m.account} | {m.holder}
              </div>
            </div>
          ))}
          <div style={{ background: 'rgba(255,68,68,0.1)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            ⚠️ {t('transferExact')}: <strong>{formatPrice(parseMmkAmount(selectedAmount || 0))}</strong>
          </div>
          {selectedAmount > 0 && selectedAmount < minTopup && (
            <p className="form-error" style={{ marginTop: 8 }}>
              {t('minAmountHint')}
            </p>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">{t('uploadPaymentProof')}</h2>
          <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 12 }}>
            {t('uploadPaymentDesc')}
          </p>
          <PaymentProofFilePicker file={proofFile} onFileChange={setProofFile} inputId="wallet-topup-proof" />
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">{t('txnRefOptional')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('txnRefPlaceholder')}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary btn-full"
            style={{ marginTop: 16 }}
            disabled={loading || !selectedAmount || selectedAmount < minTopup}
            onClick={handleSubmit}
          >
            {loading ? t('submitting') : t('submitTopUpRequest')}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}

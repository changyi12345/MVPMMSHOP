'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShopPageShell from '@/components/ShopPageShell';
import StatusBadge from '@/components/StatusBadge';
import ProofImageModal, { ProofPreviewData } from '@/components/ProofImageModal';
import { formatPrice } from '@/lib/format-price';
import { useLang } from '@/lib/useLang';
import { useAuthUser } from '@/lib/use-auth';
import { useWallet } from '@/lib/use-wallet';
import { WalletTransaction } from '@/lib/api/wallet';

function txnIcon(type: string) {
  if (type === 'topup') return '⬆️';
  if (type === 'spend') return '⬇️';
  return '↩️';
}

function txnSign(type: string) {
  if (type === 'spend') return '-';
  return '+';
}

export default function WalletPage() {
  const router = useRouter();
  const { t } = useLang();
  const { isLoggedIn, ready } = useAuthUser();
  const { balance, transactions, loading, error } = useWallet();
  const [proofPreview, setProofPreview] = useState<ProofPreviewData | null>(null);

  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace('/auth/login?redirect=/wallet');
    }
  }, [ready, isLoggedIn, router]);

  const openProof = (txn: WalletTransaction) => {
    setProofPreview({
      title: t('uploadPaymentProof'),
      amount: txn.amount,
      reference: txn.reference,
      proofImageUrl: txn.proofImageUrl ?? null,
    });
  };

  if (!ready || !isLoggedIn) {
    return (
      <ShopPageShell title={t('wallet')} emoji="💰" badge="Account" maxWidth={640} centered>
        <p className="shop-muted" style={{ textAlign: 'center' }}>{t('loading')}</p>
      </ShopPageShell>
    );
  }

  return (
    <ShopPageShell title={t('wallet')} emoji="💰" badge="Account" maxWidth={640}>

        <div className="wallet-card">
          <p className="wallet-label">{t('availableBalance')}</p>
          {loading ? (
            <p className="wallet-balance">{t('loading')}</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : (
            <p className="wallet-balance">{formatPrice(balance)}</p>
          )}
          <Link href="/wallet/topup" className="btn btn-secondary">
            + {t('topUpWallet')}
          </Link>
        </div>

        <div className="card">
          <h2 className="section-title">{t('transactionHistory')}</h2>
          {loading ? (
            <p className="empty-text">{t('loading')}</p>
          ) : transactions.length === 0 ? (
            <p className="empty-text">{t('noTransactions')}</p>
          ) : (
            <div className="wallet-txn-list">
              {transactions.map((txn: WalletTransaction) => (
                <div key={txn.id} className="wallet-txn-item">
                  <div className="wallet-txn-icon">{txnIcon(txn.type)}</div>
                  <div className="wallet-txn-info">
                    <p className="wallet-txn-desc">{txn.description ?? txn.type}</p>
                    <p className="wallet-txn-date">
                      {new Date(txn.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {txn.type === 'topup' && txn.proofImageUrl && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ marginTop: 8 }}
                        onClick={() => openProof(txn)}
                      >
                        🖼️ {t('viewProof')}
                      </button>
                    )}
                  </div>
                  <div className="wallet-txn-amount">
                    <p className={`wallet-txn-value ${txn.type === 'spend' ? 'spend' : 'credit'}`}>
                      {txnSign(txn.type)}{formatPrice(txn.amount)}
                    </p>
                    <StatusBadge status={txn.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      <ProofImageModal data={proofPreview} onClose={() => setProofPreview(null)} />
    </ShopPageShell>
  );
}

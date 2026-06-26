'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import {
  fetchVoucher,
  formatFaceValue,
  formatMmk,
  VoucherProduct,
} from '@/lib/api/vouchers';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { addToCart, buyNow } from '@/lib/cart-store';

export default function VoucherDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [voucher, setVoucher] = useState<VoucherProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let cancelled = false;
    fetchVoucher(Number(params.id))
      .then((data) => {
        if (!cancelled) setVoucher(data);
      })
      .catch(() => {
        if (!cancelled) setNotFoundState(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [params.id]);

  if (notFoundState) notFound();
  if (loading || !voucher) {
    return (
      <PageLayout>
        <div className="container" style={{ padding: 48, textAlign: 'center', color: 'var(--dark-gray)' }}>
          Loading...
        </div>
      </PageLayout>
    );
  }

  const faceValue = formatFaceValue(voucher.faceValue, voucher.title);
  const total = voucher.unitPrice * quantity;

  const buildCartItem = () => ({
    type: 'voucher' as const,
    name: voucher.title,
    price: voucher.unitPrice,
    g2bulkProductId: voucher.id,
    quantity,
  });

  const handleAddToCart = () => {
    if (!voucher.inStock) return;
    addToCart({ ...buildCartItem(), quantity });
    showToast('Added to cart', 'success');
  };

  const handleBuyNow = () => {
    if (!voucher.inStock) return;
    buyNow({ ...buildCartItem(), quantity });
    router.push('/checkout');
  };

  return (
    <PageLayout>
      <div className="container" style={{ maxWidth: 600 }}>
        <Link
          href={`/vouchers/category/${voucher.categoryId}`}
          style={{ color: 'var(--dark-gray)', marginBottom: 24, display: 'inline-block' }}
        >
          ← Back to {voucher.categoryTitle}
        </Link>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            {voucher.imageUrl ? (
              <Image
                src={voucher.imageUrl}
                alt={voucher.title}
                width={120}
                height={120}
                className="game-card-image"
                unoptimized
                style={{ borderRadius: 12 }}
              />
            ) : (
              <div style={{ fontSize: 64 }}>🎫</div>
            )}
          </div>
          <h1 className="page-title" style={{ textAlign: 'center', marginBottom: 8 }}>{voucher.title}</h1>
          <p style={{ textAlign: 'center', color: 'var(--dark-gray)', marginBottom: 8 }}>
            {voucher.categoryTitle}
          </p>
          <p style={{ textAlign: 'center', color: 'var(--dark-gray)', marginBottom: 24 }}>
            Face Value: <strong>{faceValue}</strong>
          </p>

          <p style={{ textAlign: 'center', marginBottom: 8 }}>
            {voucher.inStock ? (
              <span className="badge badge-green">✅ In Stock ({voucher.stock})</span>
            ) : (
              <span className="badge badge-red">❌ Out of Stock</span>
            )}
          </p>

          <p style={{ textAlign: 'center', fontSize: 28, color: 'var(--gold)', fontWeight: 700, marginBottom: 24 }}>
            {formatMmk(voucher.unitPrice)}
          </p>

          {voucher.description && (
            <p style={{ color: 'var(--dark-gray)', fontSize: 14, marginBottom: 24, whiteSpace: 'pre-line' }}>
              {voucher.description}
            </p>
          )}

          <div className="form-group">
            <label className="form-label">Quantity</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span style={{ fontSize: 20, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{quantity}</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setQuantity(Math.min(voucher.stock || 1, quantity + 1))}
                disabled={!voucher.inStock}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--gray)', padding: 16, borderRadius: 8, marginBottom: 24 }}>
            <p style={{ fontWeight: 600 }}>Total: {formatMmk(total)}</p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-secondary btn-full" disabled={!voucher.inStock} onClick={handleAddToCart}>🛒 Add to Cart</button>
            <button type="button" className="btn btn-primary btn-full" disabled={!voucher.inStock} onClick={handleBuyNow}>Buy Now</button>
          </div>

          <details style={{ marginTop: 24 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>ℹ️ How to Redeem</summary>
            <ol style={{ paddingLeft: 20, marginTop: 12, color: 'var(--dark-gray)', fontSize: 14 }}>
              <li>Open the game or platform app</li>
              <li>Go to Redeem Code section</li>
              <li>Enter the voucher code after purchase</li>
            </ol>
          </details>
        </div>
      </div>
    </PageLayout>
  );
}

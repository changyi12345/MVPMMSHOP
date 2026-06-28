'use client';

import { formatMmk } from '@/lib/api/games';

type Props = {
  packageName: string;
  price: number;
  playerName: string;
  regionLabel?: string;
  regionFlag?: string;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export default function GameCheckoutPanel({
  packageName,
  price,
  playerName,
  regionLabel,
  regionFlag,
  onAddToCart,
  onBuyNow,
}: Props) {
  return (
    <>
      <div className="game-order-inline" role="region" aria-label="Order summary">
        <div className="game-order-inline-head">
          <span className="game-order-inline-title">✓ Selected</span>
          <span className="game-order-inline-price">{formatMmk(price)}</span>
        </div>
        <p className="game-order-inline-package">{packageName}</p>
        <div className="game-order-inline-meta">
          {regionLabel && (
            <span>{regionFlag} {regionLabel}</span>
          )}
          {playerName && <span>👤 {playerName}</span>}
        </div>
        <div className="game-order-actions game-order-actions--inline">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onAddToCart}>
            🛒 Cart
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onBuyNow}>
            Buy Now
          </button>
        </div>
      </div>

      <div className="game-checkout-bar" role="region" aria-label="Checkout">
        <div className="game-checkout-bar-info">
          <strong>{packageName}</strong>
          <span className="game-checkout-bar-price">{formatMmk(price)}</span>
        </div>
        <div className="game-checkout-bar-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onAddToCart} aria-label="Add to cart">
            🛒
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}

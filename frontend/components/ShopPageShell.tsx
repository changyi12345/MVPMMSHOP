import { ReactNode } from 'react';
import PageLayout from './PageLayout';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  emoji?: string;
  badge?: string;
  maxWidth?: number;
  centered?: boolean;
};

export default function ShopPageShell({
  children,
  title,
  subtitle,
  emoji,
  badge,
  maxWidth,
  centered,
}: Props) {
  return (
    <PageLayout>
      <div
        className="container shop-page-inner"
        style={maxWidth ? { maxWidth } : undefined}
      >
        {(title || subtitle) && (
          <header className={`shop-page-header${centered ? ' shop-page-header--center' : ''}`}>
            {badge && <span className="shop-page-badge">{badge}</span>}
            {title && (
              <h1 className="shop-page-title">
                {emoji && <span className="shop-page-title-emoji" aria-hidden>{emoji}</span>}
                {title}
              </h1>
            )}
            {subtitle && <p className="shop-page-subtitle">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </PageLayout>
  );
}

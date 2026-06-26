export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? '';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function isAnalyticsEnabled(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || !isAnalyticsEnabled()) return;
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
  });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === 'undefined' || !isAnalyticsEnabled()) return;
  const cleaned = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
    : undefined;
  window.gtag?.('event', eventName, cleaned);
}

export function trackBeginCheckout(value: number, items: number) {
  trackEvent('begin_checkout', {
    currency: 'MMK',
    value,
    items,
  });
}

export function trackPurchase(orderId: number, value: number, paymentMethod: string) {
  trackEvent('purchase', {
    transaction_id: String(orderId),
    currency: 'MMK',
    value,
    payment_method: paymentMethod,
  });
}

export function trackSignUp(method: string) {
  trackEvent('sign_up', { method });
}

export function trackLogin(method: string) {
  trackEvent('login', { method });
}

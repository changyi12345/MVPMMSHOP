import { apiFetch } from './client';

export interface ExchangeSettings {
  usdToMmkRate: number;
  priceMarkupPercent: number;
  updatedAt: string;
}

import type { FeatureFlags } from '../feature-flags';

export interface PaymentAccount {
  id: string;
  name: string;
  accountNumber: string;
  accountHolder: string;
  enabled?: boolean;
}

export interface ShopSettings {
  shopName: string;
  shopTagline: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  supportTelegram: string | null;
  liveChatUrl: string | null;
  paymentMethods: string[];
  paymentAccounts: PaymentAccount[];
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  minWalletTopup: number;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  usdToMmkRate?: number;
  priceMarkupPercent?: number;
  featureFlags: FeatureFlags;
  g2bulkLowBalanceThreshold?: number | null;
  g2bulkPriceAlertMinPct?: number;
  g2bulkPriceAlertMinUsd?: number;
  g2bulkAutoPriceSync?: boolean;
  updatedAt: string;
}

export interface AdminProduct {
  id: number | null;
  g2bulkId: number;
  name: string;
  type: string;
  typeLabel: string;
  sourcePrice: number | null;
  sourceCurrency: 'USD' | null;
  unitPrice: number;
  currency: 'MMK';
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
  g2bulkGameCode?: string | null;
  g2bulkProductId?: number | null;
  categoryTitle?: string | null;
  description?: string | null;
  fromApi: boolean;
}

export interface AdminOrder {
  id: number;
  status: string;
  totalPrice: number | string;
  paymentMethod: string | null;
  createdAt: string;
  user: { username: string; email: string };
  product: { name: string };
  paymentProof?: {
    reference: string | null;
    status: string;
    method?: string;
    note?: string | null;
    imageUrl?: string | null;
  } | null;
}

export interface AdminOrderDetail {
  id: number;
  status: string;
  type: string;
  paymentMethod: string | null;
  quantity: number;
  totalPrice: number;
  remark: string | null;
  createdAt: string;
  completedAt: string | null;
  user: { id: number; username: string; email: string };
  product: { id: number; name: string; type: string; unitPrice: number };
  paymentProof: {
    method: string;
    reference: string | null;
    note: string | null;
    imageUrl: string | null;
    status: string;
    rejectReason: string | null;
  } | null;
  voucherCodes: string[];
  topUpInput: {
    gameCode: string;
    playerId: string;
    serverId: string | null;
    playerName: string | null;
    catalogueName: string;
  } | null;
}

export interface WalletTopupRequest {
  id: number;
  userId: number;
  username: string;
  email: string;
  amount: number;
  description: string | null;
  reference: string | null;
  proofImageUrl: string | null;
  createdAt: string;
}

export interface UserOrderSummary {
  id: number;
  status: string;
  totalPrice: number;
  productName: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  walletBalance: number | string;
  createdAt: string;
  _count?: { orders: number };
}

export interface G2BulkPriceAlert {
  id: number;
  itemKey: string;
  itemType: string;
  label: string;
  previousUsd: number;
  currentUsd: number;
  increaseUsd: number;
  increasePct: number;
  createdAt: string;
}

export function fetchDashboard() {
  return apiFetch<{
    totalSales: number;
    totalOrders: number;
    totalUsers: number;
    pendingOrders: number;
    pendingWalletTopups: number;
    todayOrders: number;
    todaySales: number;
    activePromos: number;
    salesChart: { day: string; date: string; amount: number }[];
    recentOrders: { id: number; customer: string; total: number; status: string }[];
    g2bulkBalanceAlert?: { balance: number; threshold: number } | null;
    g2bulkPriceAlertCount?: number;
    g2bulkPriceAlerts?: G2BulkPriceAlert[];
  }>('/admin/dashboard');
}

export interface AdminNotificationItem {
  key: string;
  type: 'order' | 'wallet_topup' | 'g2bulk_price';
  id: number;
  title: string;
  message: string;
  createdAt: string;
  href: string;
}

export function fetchAdminNotifications() {
  return apiFetch<{
    pendingOrders: number;
    pendingWalletTopups: number;
    pendingG2bulkPriceAlerts?: number;
    totalPending: number;
    items: AdminNotificationItem[];
  }>('/admin/notifications');
}

export function fetchSalesReport(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const q = params.toString();
  return apiFetch<{
    totalSales: number;
    totalOrders: number;
    topProducts: { name: string; sales: number; count: number }[];
    monthlyReport: { month: string; sales: number; orders: number }[];
  }>(`/admin/reports/sales${q ? `?${q}` : ''}`);
}

export function fetchAdminProducts() {
  return apiFetch<AdminProduct[]>('/admin/products');
}

export function fetchExchangeSettings() {
  return apiFetch<ExchangeSettings>('/admin/settings/exchange');
}

export function updateExchangeSettings(data: {
  usdToMmkRate: number;
  priceMarkupPercent?: number;
}) {
  return apiFetch<ExchangeSettings>('/admin/settings/exchange', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function fetchShopSettings() {
  return apiFetch<ShopSettings>('/admin/settings/shop');
}

export function updateShopSettings(data: Partial<Omit<ShopSettings, 'updatedAt'>>) {
  return apiFetch<ShopSettings>('/admin/settings/shop', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export interface IntegrationSettings {
  g2bulkApiKeyConfigured: boolean;
  g2bulkApiKeyMasked: string | null;
  g2bulkApiKeySource: 'database' | 'environment' | 'none';
  smtpHost: string | null;
  smtpPort: number;
  smtpUser: string | null;
  smtpPassConfigured: boolean;
  smtpPassMasked: string | null;
  smtpFrom: string | null;
  smtpConfigured: boolean;
  smtpSource: 'database' | 'environment' | 'none';
  updatedAt: string;
}

export interface G2BulkDashboard {
  connected: boolean;
  error?: string;
  profile: {
    userId: number;
    username: string;
    firstName: string;
    balance: number;
  } | null;
  stats: {
    gamesCount: number;
    categoriesCount: number;
    productsCount: number;
  };
  recentTransactions: {
    id: number;
    transaction_type: string;
    amount: string;
    balance_before: string;
    balance_after: string;
    status: string;
    description: string;
    created_at: string;
  }[];
  recentOrders: {
    id: number;
    product_title: string;
    quantity: number;
    total_price: string;
    status: string;
    created_at: string;
  }[];
  priceCheck?: { checked: number; newAlerts: number; pricesUpdated?: number };
  priceAlerts?: G2BulkPriceAlert[];
}

export function fetchIntegrationSettings() {
  return apiFetch<IntegrationSettings>('/admin/settings/integrations');
}

export function updateIntegrationSettings(data: {
  g2bulkApiKey?: string | null;
  smtpHost?: string | null;
  smtpPort?: number;
  smtpUser?: string | null;
  smtpPass?: string | null;
  smtpFrom?: string | null;
}) {
  return apiFetch<IntegrationSettings>('/admin/settings/integrations', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function testSmtpIntegration(to: string) {
  return apiFetch<{ success: boolean; message: string }>('/admin/settings/integrations/test-smtp', {
    method: 'POST',
    body: JSON.stringify({ to }),
  });
}

export function fetchG2bulkDashboard() {
  return apiFetch<G2BulkDashboard>('/admin/g2bulk/dashboard');
}

export function fetchG2bulkPriceAlerts(limit = 50) {
  return apiFetch<G2BulkPriceAlert[]>(`/admin/g2bulk/price-alerts?limit=${limit}`);
}

export function checkG2bulkPrices(force = false) {
  return apiFetch<{ checked: number; newAlerts: number; pricesUpdated?: number }>(
    `/admin/g2bulk/check-prices${force ? '?force=true' : ''}`,
    { method: 'POST' },
  );
}

export function dismissG2bulkPriceAlert(id: number) {
  return apiFetch<{ ok: boolean }>(`/admin/g2bulk/price-alerts/${id}/dismiss`, { method: 'POST' });
}

export function dismissAllG2bulkPriceAlerts() {
  return apiFetch<{ dismissed: number }>('/admin/g2bulk/price-alerts/dismiss-all', { method: 'POST' });
}

export function createProduct(data: {
  name: string;
  type: string;
  unitPrice: number;
  stock?: number;
  isActive?: boolean;
  g2bulkGameCode?: string;
  g2bulkProductId?: number;
  description?: string;
}) {
  return apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProduct(id: number, data: {
  name?: string;
  type?: string;
  unitPrice?: number;
  stock?: number;
  isActive?: boolean;
  g2bulkGameCode?: string;
  description?: string;
}) {
  return apiFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteProduct(id: number) {
  return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
}

export function toggleProductActive(payload: {
  id?: number;
  g2bulkGameCode?: string;
  g2bulkProductId?: number;
}) {
  return apiFetch<AdminProduct>('/admin/products/toggle-active', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchAdminOrders() {
  return apiFetch<AdminOrder[]>('/admin/orders');
}

export function fetchOrderDetail(orderId: number) {
  return apiFetch<AdminOrderDetail>(`/admin/orders/${orderId}`);
}

export function fetchAdminUsers() {
  return apiFetch<AdminUser[]>('/admin/users');
}

export function fetchUserOrders(userId: number) {
  return apiFetch<UserOrderSummary[]>(`/admin/users/${userId}/orders`);
}

export function updateUserRole(userId: number, role: string) {
  return apiFetch<AdminUser>(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export function adjustUserWallet(userId: number, amount: number, note?: string) {
  return apiFetch<{ walletBalance: number }>(`/admin/users/${userId}/wallet`, {
    method: 'PUT',
    body: JSON.stringify({ amount, note }),
  });
}

export function fetchPendingWalletTopups() {
  return apiFetch<WalletTopupRequest[]>('/admin/wallet/topups');
}

export function verifyWalletTopup(id: number) {
  return apiFetch(`/admin/wallet/topups/${id}/verify`, { method: 'POST' });
}

export function rejectWalletTopup(id: number, reason?: string) {
  return apiFetch(`/admin/wallet/topups/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export interface ActivityLog {
  id: number;
  action: string;
  entity: string | null;
  entityId: string | null;
  detail: string | null;
  createdAt: string;
}

export interface WalletTransactionRow {
  id: number;
  userId: number;
  username: string;
  email: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  reference: string | null;
  proofImageUrl: string | null;
  createdAt: string;
}

export interface ReferralStat {
  id: number;
  username: string;
  email: string;
  referralCode: string | null;
  referralCount: number;
  joinedAt: string;
}

export function fetchActivityLogs(limit = 100) {
  return apiFetch<ActivityLog[]>(`/admin/activity?limit=${limit}`);
}

export function fetchWalletTransactions(limit = 100) {
  return apiFetch<WalletTransactionRow[]>(`/admin/wallet/transactions?limit=${limit}`);
}

export function fetchReferralStats() {
  return apiFetch<ReferralStat[]>('/admin/referrals');
}

export function verifyPayment(orderId: number) {
  return apiFetch(`/admin/orders/${orderId}/verify-payment`, { method: 'POST' });
}

export function rejectPayment(orderId: number, reason?: string) {
  return apiFetch(`/admin/orders/${orderId}/reject-payment`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function refundOrder(orderId: number, reason?: string) {
  return apiFetch<AdminOrderDetail>(`/admin/orders/${orderId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function retryFulfillment(orderId: number) {
  return apiFetch<{ order: AdminOrderDetail }>(`/admin/orders/${orderId}/retry-fulfillment`, {
    method: 'POST',
  });
}

export function fetch2faStatus() {
  return apiFetch<{ enabled: boolean }>('/admin/2fa/status');
}

export function setup2fa() {
  return apiFetch<{ secret: string; otpauthUrl: string }>('/admin/2fa/setup', { method: 'POST' });
}

export function enable2fa(code: string) {
  return apiFetch<{ enabled: boolean; backupCodes: string[] }>('/admin/2fa/enable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function disable2fa(password: string, code: string) {
  return apiFetch<{ enabled: boolean }>('/admin/2fa/disable', {
    method: 'POST',
    body: JSON.stringify({ password, code }),
  });
}

export function updateOrderStatus(orderId: number, status: string) {
  return apiFetch(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export type AdminBanner = import('./content').ShopBanner;
export type AdminEvent = import('./content').ShopEvent;

export function fetchAdminBanners() {
  return apiFetch<AdminBanner[]>('/admin/banners');
}

export function createBanner(data: Partial<AdminBanner> & { title: string; imageUrl: string }) {
  return apiFetch<AdminBanner>('/admin/banners', { method: 'POST', body: JSON.stringify(data) });
}

export function updateBanner(id: number, data: Partial<AdminBanner>) {
  return apiFetch<AdminBanner>(`/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteBanner(id: number) {
  return apiFetch(`/admin/banners/${id}`, { method: 'DELETE' });
}

export function fetchAdminEvents() {
  return apiFetch<AdminEvent[]>('/admin/events');
}

export function createEvent(data: { title: string; content: string } & Partial<AdminEvent>) {
  return apiFetch<AdminEvent>('/admin/events', { method: 'POST', body: JSON.stringify(data) });
}

export function updateEvent(id: number, data: Partial<AdminEvent>) {
  return apiFetch<AdminEvent>(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteEvent(id: number) {
  return apiFetch(`/admin/events/${id}`, { method: 'DELETE' });
}

export function updateBranding(data: { logoUrl?: string | null; faviconUrl?: string | null }) {
  return apiFetch<{ logoUrl: string | null; faviconUrl: string | null }>('/admin/settings/branding', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

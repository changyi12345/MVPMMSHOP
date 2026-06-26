'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  fetchExchangeSettings,
  fetchShopSettings,
  fetchIntegrationSettings,
  updateExchangeSettings,
  updateShopSettings,
  updateIntegrationSettings,
  testSmtpIntegration,
  ShopSettings,
  ExchangeSettings,
  PaymentAccount,
  IntegrationSettings,
} from '@/lib/api/admin';
import { formatPrice } from '@/lib/format-price';
import { useAdminLang } from '@/lib/useAdminLang';
import { useToast } from '@/components/Toast';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from '@/lib/feature-flags';

type Tab = 'general' | 'currency' | 'payment' | 'features' | 'integrations';

const FEATURE_TOGGLES: { key: keyof FeatureFlags; label: string; desc: string }[] = [
  { key: 'registrationEnabled', label: 'User Registration', desc: 'Allow new account sign-up' },
  { key: 'googleLoginEnabled', label: 'Google Login', desc: 'Sign in with Google button' },
  { key: 'walletEnabled', label: 'Wallet', desc: 'Wallet balance & pay at checkout' },
  { key: 'walletTopupEnabled', label: 'Wallet Top-Up', desc: 'Users can request wallet top-up' },
  { key: 'referralEnabled', label: 'Referral Program', desc: 'Referral codes & rewards page' },
  { key: 'promoCodesEnabled', label: 'Promo Codes', desc: 'Cart/checkout promo validation' },
  { key: 'userOrderCancelEnabled', label: 'User Order Cancel', desc: 'Users cancel pending orders' },
  { key: 'gamesTopupEnabled', label: 'Games Top-Up Shop', desc: '/games pages & API' },
  { key: 'voucherShopEnabled', label: 'Voucher Shop', desc: '/vouchers pages & API' },
  { key: 'eventsEnabled', label: 'Events & News', desc: '/events pages' },
  { key: 'emailNotificationsEnabled', label: 'Email Notifications', desc: 'Order/refund/wallet emails' },
  { key: 'liveChatEnabled', label: 'Support Links', desc: 'Telegram & live chat in footer' },
  { key: 'smsOtpEnabled', label: 'SMS OTP', desc: 'Phone verification on register & profile' },
  { key: 'smsOrderAlertsEnabled', label: 'SMS Order Alerts', desc: 'Text when order completes' },
];

function slugPaymentId(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('kbz')) return 'kbz';
  if (lower.includes('wave')) return 'wave';
  if (lower.includes('bank')) return 'bank';
  return lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `method-${Date.now()}`;
}

function emptyAccount(): PaymentAccount {
  return { id: `new-${Date.now()}`, name: '', accountNumber: '', accountHolder: '' };
}

export default function AdminSettingsPage() {
  const { t } = useAdminLang();
  const [tab, setTab] = useState<Tab>('general');
  const [shop, setShop] = useState<ShopSettings | null>(null);
  const [exchange, setExchange] = useState<ExchangeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [shopName, setShopName] = useState('');
  const [shopTagline, setShopTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [supportTelegram, setSupportTelegram] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [minWalletTopup, setMinWalletTopup] = useState('');
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [rateInput, setRateInput] = useState('');
  const [markupInput, setMarkupInput] = useState('');
  const [g2bulkAutoPriceSync, setG2bulkAutoPriceSync] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationSettings | null>(null);
  const [g2bulkApiKey, setG2bulkApiKey] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [smtpTestTo, setSmtpTestTo] = useState('');
  const [liveChatUrl, setLiveChatUrl] = useState('');
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [g2bulkAlertThreshold, setG2bulkAlertThreshold] = useState('');
  const [g2bulkPriceAlertMinPct, setG2bulkPriceAlertMinPct] = useState('2');
  const [g2bulkPriceAlertMinUsd, setG2bulkPriceAlertMinUsd] = useState('0.25');

  useEffect(() => {
    Promise.all([fetchShopSettings(), fetchExchangeSettings(), fetchIntegrationSettings()])
      .then(([s, e, i]) => {
        setShop(s);
        setExchange(e);
        setIntegrations(i);
        setShopName(s.shopName);
        setShopTagline(s.shopTagline ?? '');
        setContactEmail(s.contactEmail ?? '');
        setContactPhone(s.contactPhone ?? '');
        setSupportTelegram(s.supportTelegram ?? '');
        setLiveChatUrl(s.liveChatUrl ?? '');
        setFeatureFlags({ ...DEFAULT_FEATURE_FLAGS, ...s.featureFlags });
        setG2bulkAlertThreshold(s.g2bulkLowBalanceThreshold != null ? String(s.g2bulkLowBalanceThreshold) : '');
        setG2bulkPriceAlertMinPct(String(s.g2bulkPriceAlertMinPct ?? 2));
        setG2bulkPriceAlertMinUsd(String(s.g2bulkPriceAlertMinUsd ?? 0.25));
        setG2bulkAutoPriceSync(s.g2bulkAutoPriceSync !== false);
        setMaintenanceMode(s.maintenanceMode);
        setMaintenanceMessage(s.maintenanceMessage ?? '');
        setMinWalletTopup(String(s.minWalletTopup));
        setPaymentAccounts(
          s.paymentAccounts?.length
            ? s.paymentAccounts
            : (s.paymentMethods ?? []).map((name) => ({
                id: slugPaymentId(name),
                name,
                accountNumber: s.contactPhone ?? '',
                accountHolder: s.shopName,
              })),
        );
        setRateInput(String(e.usdToMmkRate));
        setMarkupInput(String(e.priceMarkupPercent));
        setSmtpHost(i.smtpHost ?? '');
        setSmtpPort(String(i.smtpPort ?? 587));
        setSmtpUser(i.smtpUser ?? '');
        setSmtpFrom(i.smtpFrom ?? '');
        setG2bulkApiKey('');
        setSmtpPass('');
      })
      .catch(() => showToast('Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const updated = await updateShopSettings({
        shopName: shopName.trim(),
        shopTagline: shopTagline.trim() || null,
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
        supportTelegram: supportTelegram.trim() || null,
        liveChatUrl: liveChatUrl.trim() || null,
        maintenanceMode,
        maintenanceMessage: maintenanceMessage.trim() || null,
        minWalletTopup: Number(minWalletTopup),
      });
      setShop(updated);
      showToast('General settings saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updatePaymentAccount = (index: number, field: keyof PaymentAccount, value: string) => {
    setPaymentAccounts((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === 'enabled') {
          return { ...item, enabled: value === 'true' };
        }
        const next = { ...item, [field]: value };
        if (field === 'name' && (item.id.startsWith('new-') || !item.id)) {
          next.id = slugPaymentId(value);
        }
        return next;
      }),
    );
  };

  const handleSavePayment = async () => {
    const accounts = paymentAccounts
      .map((item, index) => ({
        id: item.id.trim() || slugPaymentId(item.name) || `method-${index}`,
        name: item.name.trim(),
        accountNumber: item.accountNumber.trim(),
        accountHolder: item.accountHolder.trim(),
        enabled: item.enabled !== false,
      }))
      .filter((item) => item.name.length > 0);

    if (accounts.length === 0) {
      showToast('Add at least one payment method', 'error');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateShopSettings({ paymentAccounts: accounts });
      setShop(updated);
      setPaymentAccounts(updated.paymentAccounts ?? accounts);
      showToast('Payment methods saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCurrency = async () => {
    const usdToMmkRate = Number(rateInput);
    const priceMarkupPercent = Number(markupInput);
    if (!Number.isFinite(usdToMmkRate) || usdToMmkRate <= 0) {
      showToast('Enter a valid MMK rate', 'error');
      return;
    }
    setSaving(true);
    try {
      const [updated, shopUpdated] = await Promise.all([
        updateExchangeSettings({ usdToMmkRate, priceMarkupPercent }),
        updateShopSettings({ g2bulkAutoPriceSync }),
      ]);
      setExchange(updated);
      setShop(shopUpdated);
      showToast('Currency settings saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIntegrations = async () => {
    setSaving(true);
    try {
      const payload: Parameters<typeof updateIntegrationSettings>[0] = {
        smtpHost: smtpHost.trim() || null,
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser.trim() || null,
        smtpFrom: smtpFrom.trim() || null,
      };
      if (g2bulkApiKey.trim()) payload.g2bulkApiKey = g2bulkApiKey.trim();
      if (smtpPass.trim()) payload.smtpPass = smtpPass.trim();

      const updated = await updateIntegrationSettings(payload);
      setIntegrations(updated);
      setG2bulkApiKey('');
      setSmtpPass('');
      showToast('Integration settings saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!smtpTestTo.trim()) {
      showToast('Enter a test email address', 'error');
      return;
    }
    if (!integrations?.smtpPassConfigured && !smtpPass.trim()) {
      showToast('Enter SMTP password and click Save before testing', 'error');
      return;
    }
    setSaving(true);
    try {
      const result = await testSmtpIntegration(smtpTestTo.trim());
      showToast(result.message, result.success ? 'success' : 'error');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'SMTP test failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeatures = async () => {
    setSaving(true);
    try {
      const threshold = g2bulkAlertThreshold.trim() === '' ? null : Number(g2bulkAlertThreshold);
      const minPct = g2bulkPriceAlertMinPct.trim() === '' ? 2 : Number(g2bulkPriceAlertMinPct);
      const minUsd = g2bulkPriceAlertMinUsd.trim() === '' ? 0.25 : Number(g2bulkPriceAlertMinUsd);
      const updated = await updateShopSettings({
        featureFlags,
        liveChatUrl: liveChatUrl.trim() || null,
        g2bulkLowBalanceThreshold: threshold,
        g2bulkPriceAlertMinPct: minPct,
        g2bulkPriceAlertMinUsd: minUsd,
      });
      setShop(updated);
      setFeatureFlags({ ...DEFAULT_FEATURE_FLAGS, ...updated.featureFlags });
      showToast('Feature settings saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (key: keyof FeatureFlags) => {
    setFeatureFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const exampleMmk = exchange
    ? Math.round(10 * exchange.usdToMmkRate * (1 + exchange.priceMarkupPercent / 100))
    : null;

  return (
    <AdminLayout>
      <h1 className="page-title">{t('adminSettings')}</h1>
      <p style={{ color: 'var(--dark-gray)', marginBottom: 16 }}>{t('adminSettingsDesc')}</p>

      <div className="filter-chips" style={{ marginBottom: 24 }}>
        {(['general', 'currency', 'payment', 'features', 'integrations'] as Tab[]).map((tabKey) => (
          <button key={tabKey} type="button" className={`chip ${tab === tabKey ? 'active' : ''}`} onClick={() => setTab(tabKey)}>
            {tabKey === 'general'
              ? t('adminTabGeneral')
              : tabKey === 'currency'
                ? t('adminTabCurrency')
                : tabKey === 'payment'
                  ? t('adminTabPayment')
                  : tabKey === 'features'
                    ? 'Features'
                    : t('adminTabIntegrations')}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--dark-gray)' }}>{t('loading')}</p>
      ) : tab === 'general' ? (
        <div className="card" style={{ maxWidth: 560, padding: 24 }}>
          <h2 className="section-title">🏪 Shop Info</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="shop-name">Shop Name</label>
            <input id="shop-name" className="form-input" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="shop-tag">Tagline</label>
            <input id="shop-tag" className="form-input" value={shopTagline} onChange={(e) => setShopTagline(e.target.value)} placeholder="Game top-up & vouchers" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contact-email">Contact Email</label>
            <input id="contact-email" type="email" className="form-input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="mvpmmshop@rankage.shop" />
            <p style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 6, marginBottom: 0 }}>
              Used as Reply-To on order, password reset, and wallet emails.
            </p>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contact-phone">Contact Phone</label>
            <input id="contact-phone" className="form-input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="support-tg">Telegram Support</label>
            <input id="support-tg" className="form-input" value={supportTelegram} onChange={(e) => setSupportTelegram(e.target.value)} placeholder="@mvpmms_support" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="live-chat">Live Chat URL (Tawk.to / Crisp)</label>
            <input id="live-chat" className="form-input" value={liveChatUrl} onChange={(e) => setLiveChatUrl(e.target.value)} placeholder="https://tawk.to/chat/..." />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="min-topup">Min Wallet Top-Up (MMK)</label>
            <input id="min-topup" type="number" min={1} className="form-input" value={minWalletTopup} onChange={(e) => setMinWalletTopup(e.target.value)} />
          </div>

          <h2 className="section-title" style={{ marginTop: 24 }}>🛠 Maintenance Mode</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
            Enable maintenance mode (shop temporarily closed)
          </label>
          <div className="form-group">
            <label className="form-label" htmlFor="maint-msg">Maintenance Message</label>
            <textarea id="maint-msg" className="form-input" rows={3} value={maintenanceMessage} onChange={(e) => setMaintenanceMessage(e.target.value)} placeholder="We will be back soon..." />
          </div>
          {shop && (
            <p style={{ fontSize: 12, color: 'var(--dark-gray)', marginBottom: 16 }}>
              Last updated: {new Date(shop.updatedAt).toLocaleString()}
            </p>
          )}
          <button type="button" className="btn btn-primary" onClick={handleSaveGeneral} disabled={saving}>
            {saving ? 'Saving...' : 'Save General Settings'}
          </button>
        </div>
      ) : tab === 'currency' ? (
        <div className="card" style={{ maxWidth: 520, padding: 24 }}>
          <h2 className="section-title">💱 Currency — USD to MMK</h2>
          <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 20 }}>
            G2Bulk API prices are in USD. Shop prices on web &amp; mobile are calculated automatically:
            <strong> G2Bulk USD × Exchange Rate × (1 + Markup %)</strong>. Set markup for your profit margin.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div className="form-group" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
              <label className="form-label" htmlFor="set-rate">1 USD = MMK</label>
              <input id="set-rate" type="number" min={1} className="form-input" value={rateInput} onChange={(e) => setRateInput(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 120, marginBottom: 0 }}>
              <label className="form-label" htmlFor="set-markup">Profit Markup %</label>
              <input id="set-markup" type="number" min={0} max={100} step={0.1} className="form-input" value={markupInput} onChange={(e) => setMarkupInput(e.target.value)} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={g2bulkAutoPriceSync}
              onChange={(e) => setG2bulkAutoPriceSync(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              <strong style={{ display: 'block' }}>Auto-sync prices from G2Bulk API</strong>
              <span style={{ fontSize: 13, color: 'var(--dark-gray)' }}>
                When G2Bulk source price changes, web &amp; mobile shop prices update automatically (with your markup).
                Turn off only if you want to set fixed MMK prices manually.
              </span>
            </span>
          </label>
          {exampleMmk != null && (
            <p style={{ fontSize: 13, color: 'var(--dark-gray)', marginBottom: 16 }}>
              Example: $10 USD → {formatPrice(exampleMmk)}
            </p>
          )}
          <button type="button" className="btn btn-primary" onClick={handleSaveCurrency} disabled={saving}>
            {saving ? 'Saving...' : 'Save Currency Settings'}
          </button>
        </div>
      ) : tab === 'payment' ? (
        <div className="card" style={{ maxWidth: 720, padding: 24 }}>
          <h2 className="section-title">💳 Payment Methods</h2>
          <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>
            Account numbers and holder names shown at checkout and wallet top-up. Wallet balance payments are processed automatically; KBZ/Wave/Bank require admin verification.
          </p>

          {paymentAccounts.map((account, index) => (
            <div
              key={account.id || index}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <strong>Method {index + 1}</strong>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={account.enabled !== false}
                    onChange={(e) => updatePaymentAccount(index, 'enabled', e.target.checked ? 'true' : 'false')}
                  />
                  Enabled
                </label>
                {paymentAccounts.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '4px 12px', fontSize: 13 }}
                    onClick={() => setPaymentAccounts((prev) => prev.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Method Name</label>
                <input
                  className="form-input"
                  value={account.name}
                  onChange={(e) => updatePaymentAccount(index, 'name', e.target.value)}
                  placeholder="KBZ Pay"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account / Phone Number</label>
                <input
                  className="form-input"
                  value={account.accountNumber}
                  onChange={(e) => updatePaymentAccount(index, 'accountNumber', e.target.value)}
                  placeholder="09xxxxxxxxx"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Account Holder Name</label>
                <input
                  className="form-input"
                  value={account.accountHolder}
                  onChange={(e) => updatePaymentAccount(index, 'accountHolder', e.target.value)}
                  placeholder="Shop owner name"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-outline"
            style={{ marginBottom: 16 }}
            onClick={() => setPaymentAccounts((prev) => [...prev, emptyAccount()])}
          >
            + Add Payment Method
          </button>

          <button type="button" className="btn btn-primary" onClick={handleSavePayment} disabled={saving}>
            {saving ? 'Saving...' : 'Save Payment Methods'}
          </button>
        </div>
      ) : tab === 'features' ? (
        <div className="card" style={{ maxWidth: 720, padding: 24 }}>
          <h2 className="section-title">🎛 Shop Features</h2>
          <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 20 }}>
            Turn features on/off without redeploying. Disabled features are hidden on the shop and blocked on the API.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {FEATURE_TOGGLES.map(({ key, label, desc }) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 12,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={featureFlags[key]}
                  onChange={() => toggleFeature(key)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  <strong style={{ display: 'block' }}>{label}</strong>
                  <span style={{ fontSize: 13, color: 'var(--dark-gray)' }}>{desc}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="g2bulk-alert">G2Bulk Low Balance Alert (USD)</label>
            <input
              id="g2bulk-alert"
              type="number"
              min={0}
              className="form-input"
              value={g2bulkAlertThreshold}
              onChange={(e) => setG2bulkAlertThreshold(e.target.value)}
              placeholder="e.g. 50 — alert on admin dashboard when below"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="g2bulk-price-pct">G2Bulk Price Increase Alert Min (%)</label>
            <input
              id="g2bulk-price-pct"
              type="number"
              min={0}
              max={100}
              step={0.1}
              className="form-input"
              value={g2bulkPriceAlertMinPct}
              onChange={(e) => setG2bulkPriceAlertMinPct(e.target.value)}
              placeholder="2 — recommended; ignores tiny fluctuations"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="g2bulk-price-usd">G2Bulk Price Increase Alert Min (USD)</label>
            <input
              id="g2bulk-price-usd"
              type="number"
              min={0}
              step={0.01}
              className="form-input"
              value={g2bulkPriceAlertMinUsd}
              onChange={(e) => setG2bulkPriceAlertMinUsd(e.target.value)}
              placeholder="0.25 — e.g. skip $0.01 bumps"
            />
            <p style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 6, marginBottom: 0 }}>
              Alert only when G2Bulk price rises by at least this % <strong>and</strong> USD amount. Bell shows one summary, not every product.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleSaveFeatures} disabled={saving}>
            {saving ? 'Saving...' : 'Save Feature Settings'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 720, padding: 24 }}>
          <h2 className="section-title">🔌 G2Bulk API</h2>
          <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>
            Used for game top-ups and voucher fulfillment. Get your key from{' '}
            <a href="https://t.me/G2BULKBOT" target="_blank" rel="noopener noreferrer">@G2BULKBOT</a>.
            {integrations?.g2bulkApiKeyConfigured && (
              <> Current: <code>{integrations.g2bulkApiKeyMasked}</code> ({integrations.g2bulkApiKeySource})</>
            )}
          </p>
          <div className="form-group">
            <label className="form-label" htmlFor="g2bulk-key">API Key</label>
            <input
              id="g2bulk-key"
              type="password"
              className="form-input"
              value={g2bulkApiKey}
              onChange={(e) => setG2bulkApiKey(e.target.value)}
              placeholder={integrations?.g2bulkApiKeyConfigured ? 'Leave blank to keep current key' : 'Paste G2Bulk API key'}
              autoComplete="off"
            />
          </div>

          <h2 className="section-title" style={{ marginTop: 28 }}>📧 SMTP Email</h2>
          <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>
            Order notifications, password reset, and wallet approval emails.
            {integrations?.smtpConfigured && (
              <> Configured via {integrations.smtpSource}{integrations.smtpPassMasked ? ` (pass: ${integrations.smtpPassMasked})` : ''}.</>
            )}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="smtp-host">SMTP Host</label>
              <input id="smtp-host" className="form-input" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="rankage.shop or mail.rankage.shop" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="smtp-port">Port</label>
              <input id="smtp-port" type="number" className="form-input" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="smtp-user">Username</label>
              <input id="smtp-user" className="form-input" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="smtp-pass">Password</label>
              <input
                id="smtp-pass"
                type="password"
                className="form-input"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder={integrations?.smtpPassConfigured ? 'Leave blank to keep current' : 'App password'}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="smtp-from">From Address</label>
              <input id="smtp-from" className="form-input" value={smtpFrom} onChange={(e) => setSmtpFrom(e.target.value)} placeholder="MVPMMSHOP &lt;noreply@rankage.shop&gt;" />
              <p style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 6, marginBottom: 0 }}>
                Must be a real mailbox on your domain (e.g. noreply@rankage.shop), not noreply@mvpmms.com.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 8 }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
              <label className="form-label" htmlFor="smtp-test">Test recipient</label>
              <input id="smtp-test" type="email" className="form-input" value={smtpTestTo} onChange={(e) => setSmtpTestTo(e.target.value)} placeholder="admin@example.com" />
            </div>
            <button type="button" className="btn btn-outline" onClick={handleTestSmtp} disabled={saving}>
              Send Test Email
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={handleSaveIntegrations} disabled={saving}>
              {saving ? 'Saving...' : 'Save Integrations'}
            </button>
            <Link href="/admin/g2bulk" className="btn btn-secondary">
              Open G2Bulk Dashboard →
            </Link>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

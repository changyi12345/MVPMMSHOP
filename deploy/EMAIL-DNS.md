# Email deliverability — SPF, DKIM, DMARC (rankage.shop)

Transactional mail from `mvpmmshop@rankage.shop` lands in spam when DNS auth is missing or weak.

## 1. cPanel (recommended first)

**Email Deliverability** (or **Authentication**) → domain `rankage.shop`:

1. **SPF** — Install / Repair → status **Valid**
2. **DKIM** — Enable → add suggested TXT record to DNS if not auto-applied
3. Wait 15–60 minutes for DNS propagation

## 2. DMARC (manual DNS)

cPanel → **Zone Editor** → `rankage.shop` → Add TXT:

| Name | Type | Value |
|------|------|--------|
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:mvpmmshop@rankage.shop; fo=1` |

Start with `p=none` (monitor only). After 2–4 weeks of clean sending, consider `p=quarantine`.

## 3. Reply-To (app)

**Admin → Settings → General → Contact email** = support address (e.g. `mvpmmshop@rankage.shop`).

All shop emails use this as **Reply-To** automatically.

## 4. Test score

1. Open [mail-tester.com](https://www.mail-tester.com)
2. Copy the test address
3. Admin → Settings → Integrations → Send test email
4. Target **8/10+** — fix SPF/DKIM if lower

## 5. Gmail habits

- Mark first emails **Not spam**
- Avoid subject lines like "SMTP Test" (app now uses transactional-style subjects)

# 503 Service Unavailable — အမြန် ပြန်ထူထားနည်း

**လက္ခဏာ:** `503 Service Unavailable` / `The server is temporarily busy`

**အကြောင်းရင်း (zwhhosting/cPanel):**
- Node.js app **stopped** သို့ **crash**
- `.htaccess` **empty** → LiteSpeed က app ဆီ proxy မလုပ်ပါ
- Node process **အများကြီး** → CageFS process limit (`fork: Resource temporarily unavailable`)

---

## ⚡ အမြန်ဆုံး Fix (cPanel browser — Terminal မသုံးပါ)

### 1) Node apps နှစ်ခု **Stop**

**Setup Node.js App** → **Stop**:
1. `api.rankage.shop`
2. `rankage.shop`

**10–15 မိနစ်** စောင့်ပါ (process limit clear)

---

### 2) `.htaccess` စစ် + ပြင်ပါ (File Manager)

#### API — folder: `api.rankage.shop` (home root, `public_html` **မဟုတ်**)

File: `.htaccess` — `deploy/htaccess-api.template` အတိုင်း **Passenger block** ပါရမယ် (empty **မဖြစ်ရ**)

#### Web — folder: `public_html/rankage.shop`

File: `.htaccess` — `deploy/htaccess-web.template` အတိုင်း

Permissions: **644**

> `touch .htaccess` (empty) **မလုပ်ပါ** — 503/404 ပြန်ဖြစ်ပါမယ်

---

### 3) Start — API အရင်

**Setup Node.js App** → `api.rankage.shop`:
- Application root: `api.rankage.shop`
- Startup file: `server.js`
- Mode: Production
- **Start**

Browser test: `https://api.rankage.shop/health` → **200** + `{"ok":true}`

---

### 4) Start — Web

**Setup Node.js App** → `rankage.shop`:
- Application root: `public_html/rankage.shop`
- Startup file: `server.js`
- **Start**

Browser test: `https://rankage.shop` → **200**

---

## Terminal သုံးလို့ရရင် (Stop ပြီး 15 min နောက်)

```bash
bash ~/public_html/rankage.shop/fix-503-cpanel.sh
```

သို့ manual:

```bash
# Process count
ps aux | grep lsnode | grep ztkopszw | grep -v grep | wc -l
# 0–2 ခု ဖြစ်သင့်ပါတယ် — 5+ ဆိုရင် apps Stop + wait
```

---

## မရသေးရင်

| Problem | Fix |
|---------|-----|
| API `/health` 503 | API `.htaccess` + cPanel Restart API |
| Web 503, API OK | Web `.htaccess` + chmod `.next` (755 dirs, 644 files) |
| `EACCES .next/static/chunks` | `find .next -type d -exec chmod 755 {} \;` + `find .next -type f -exec chmod 644 {} \;` |
| `prepare() failed` | PC က `deploy-web.zip` ပြန် upload — server မှာ `npm run build` **မလုပ်ပါ** |
| Terminal fork error | cPanel Stop apps only — 15 min wait — Terminal မသုံးပါ |

---

## PC က verify

```powershell
powershell -ExecutionPolicy Bypass -File deploy\verify-prod.ps1
```

Expected: `[OK 200]` for API health + Web home

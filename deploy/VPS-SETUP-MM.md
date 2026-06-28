# rankage.shop — VPS တင်နည်း (cPanel မလို)

VPS ဝယ်ပြီးရင် **Passenger / .htaccess / CageFS** မလိုတော့ပါ — **Nginx + PM2 + Node 20** သုံးပါမယ်။

| Service | URL |
|---------|-----|
| Web + Admin | https://rankage.shop |
| API | https://api.rankage.shop |

Database: **Supabase / Neon** (cloud PostgreSQL — VPS ထဲ DB install မလုပ်ပါ)

---

## လိုအပ်ချက်

- VPS: **Ubuntu 22.04** or **24.04** (1 GB RAM minimum, **2 GB** recommended)
- Domain `rankage.shop` DNS edit access
- SSH login (root or sudo user)
- PC မှာ project folder (`MVPMMSHOP`)

---

## Step 0 — DNS ပြောင်းပါ (domain registrar)

VPS public IP ကို A record ထည့်ပါ (cPanel hosting IP **ဖယ်ပါ**):

| Type | Name | Value |
|------|------|-------|
| A | `@` | `<VPS_IP>` |
| A | `api` | `<VPS_IP>` |
| A | `www` | `<VPS_IP>` (optional) |

5–30 မိနစ် စောင့်ပါ (`ping rankage.shop` → VPS IP ဖြစ်ရမယ်)

---

## Step 1 — VPS SSH ဝင်ပါ

PC PowerShell:

```powershell
ssh root@<VPS_IP>
```

(သို့ `ubuntu@<VPS_IP>` — provider ပေးတဲ့ user)

---

## Step 2 — Server bootstrap

VPS ထဲ:

```bash
# Option A — repo upload ပြီးသား
cd /var/www/mvpmms
sudo bash deploy/vps-setup.sh

# Option B — repo မရှိသေးရင် folder ဖန်တီးပြီး PC က upload
sudo mkdir -p /var/www/mvpmms
sudo chown -R $USER:$USER /var/www
```

`vps-setup.sh` က install လုပ်ပေးမယ်:
- Node.js 20, Nginx, Certbot, PM2, Git, UFW firewall

---

## Step 3 — Code upload (PC → VPS)

### Option A — Git (recommended)

VPS:

```bash
cd /var/www
git clone <YOUR_GITHUB_REPO_URL> mvpmms
cd mvpmms
```

### Option B — ZIP / SCP (Windows PowerShell)

PC:

```powershell
cd C:\Users\champ\OneDrive\Desktop\MVPMMSHOP
# Exclude node_modules — zip manually or use scp -r for deploy folders
scp -r backend frontend deploy root@<VPS_IP>:/var/www/mvpmms/
```

VPS မှာ structure:

```
/var/www/mvpmms/
├── backend/
├── frontend/
└── deploy/
```

---

## Step 4 — Environment files

VPS:

```bash
cd /var/www/mvpmms
cp deploy/backend.env.vps.example backend/.env
cp deploy/frontend.env.vps.example frontend/.env.production
nano backend/.env
nano frontend/.env.production
```

### `backend/.env` — အရေးကြီးဆုံး

- `DATABASE_URL` + `DIRECT_URL` — Supabase/Neon URLs (cPanel env က copy လုပ်လို့ရ)
- `JWT_SECRET` — အရှည် random string
- `G2BULK_API_KEY`, `GOOGLE_CLIENT_ID`
- `SMTP_*` — VPS မှာ mail server မရှိရင် **external SMTP** (Gmail, Brevo, Mailgun) သုံးပါ
- `VAPID_*` — web push (cPanel env က copy)
- **`PORT=4000`** — VPS မှာ ထားပါ (cPanel လို delete မလုပ်ရ)

### `frontend/.env.production`

- `NEXT_PUBLIC_API_URL=https://api.rankage.shop`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY=...`

> `NEXT_PUBLIC_*` က **build မတိုင်မီ** `.env.production` ထဲ ရှိရမယ်

---

## Step 5 — Build + PM2 start

```bash
cd /var/www/mvpmms
bash deploy/vps-deploy.sh --first
```

PM2 startup (reboot ပြီး auto-start):

```bash
pm2 startup
# printed command ကို copy run (sudo env PATH=...)
pm2 save
```

Local test (VPS ထဲ):

```bash
curl -s http://127.0.0.1:4000/health
curl -sI http://127.0.0.1:3000/
```

`{"ok":true}` + `HTTP/1.1 200` ရရမယ်

---

## Step 6 — Nginx + SSL

**ပထမဆုံး** HTTP-only config (cert မရှိသေးရင်):

```bash
cd /var/www/mvpmms
sudo cp deploy/nginx-rankage.shop.initial.conf /etc/nginx/sites-available/rankage.shop
sudo ln -sf /etc/nginx/sites-available/rankage.shop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

DNS propagate ဖြစ်ပြီး browser: `http://rankage.shop` test

SSL certificate:

```bash
sudo certbot --nginx -d rankage.shop -d www.rankage.shop -d api.rankage.shop
```

**SSL ပြီးရင်** full config (HTTP→HTTPS redirect):

```bash
sudo cp deploy/nginx-rankage.shop.conf /etc/nginx/sites-available/rankage.shop
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 7 — Production verify

PC:

```powershell
powershell -ExecutionPolicy Bypass -File deploy\verify-prod.ps1
```

Browser:
- https://rankage.shop
- https://rankage.shop/admin/login
- https://api.rankage.shop/health

Admin password ပြောင်းပါ (default seed: `admin` / `admin123`)

---

## Update / Redeploy (code change)

VPS:

```bash
cd /var/www/mvpmms
git pull    # or re-upload changed files
bash deploy/vps-deploy.sh
```

---

## cPanel → VPS migration checklist

| cPanel | VPS |
|--------|-----|
| `.htaccess` Passenger | **မလို** |
| Setup Node.js App | **PM2** |
| cPanel env vars | `backend/.env` file |
| `public_html/rankage.shop` | `/var/www/mvpmms/frontend` |
| `api.rankage.shop` folder | `/var/www/mvpmms/backend` |
| AutoSSL | **Certbot** |
| Neon/Supabase DB | **Same DB** — URL copy only |

**DNS** VPS IP သို့ ပြောင်းပြီးမှ cPanel hosting cancel လုပ်ပါ (downtime ရှောင်ဖို့ VPS OK ဖြစ်မှ)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `502 Bad Gateway` | `pm2 logs rankage-api` / `pm2 logs rankage-web` |
| API works, web 502 | `cd frontend && npm run build` ပြန် run |
| Upload images 404 | `backend/uploads/` exists + nginx alias path |
| Payment proof upload CORS error | Nginx `location /uploads/` was catching POST — add exact-match proxy for `/uploads/payment-proof` (see `deploy/nginx-rankage.shop.conf`) |
| SSL error | DNS → VPS IP? `certbot renew --dry-run` |
| Out of memory | VPS RAM 2GB+; `pm2` restart; swap add |
| Google login fail | Google Console origins: `https://rankage.shop` |

```bash
pm2 logs rankage-api --lines 50
pm2 logs rankage-web --lines 50
pm2 monit
sudo tail -f /var/log/nginx/error.log
```

---

## Security

- [ ] `ufw` — only 22, 80, 443 open
- [ ] SSH key login (password disable optional)
- [ ] Strong `JWT_SECRET`
- [ ] Admin password changed
- [ ] `.env` files chmod 600: `chmod 600 backend/.env`

---

## Files reference

| File | Purpose |
|------|---------|
| `deploy/vps-setup.sh` | First-time VPS packages |
| `deploy/vps-deploy.sh` | Build + PM2 restart |
| `deploy/ecosystem.config.cjs` | PM2 config |
| `deploy/nginx-rankage.shop.initial.conf` | Before SSL |
| `deploy/nginx-rankage.shop.conf` | After SSL (production) |
| `deploy/backend.env.vps.example` | Backend env template |
| `deploy/frontend.env.vps.example` | Frontend env template |

English summary: **`deploy/RANKAGE.md`**

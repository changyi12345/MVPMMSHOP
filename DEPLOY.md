# MVPMMSHOP Production Deployment Guide

> **VPS (recommended):** see **`deploy/VPS-SETUP-MM.md`** (step-by-step) or **`deploy/RANKAGE.md`**  
> **cPanel hosting (50k/105k plan):** see **`deploy/CPANEL.md`**

## Domain layout (rankage.shop)

| Service | URL |
|---------|-----|
| Frontend | https://rankage.shop |
| API | https://api.rankage.shop |

## Prerequisites

- VPS or cloud server (Ubuntu 22.04+ recommended)
- Domain name pointed to server IP
- PostgreSQL 14+
- Node.js 20 LTS
- Nginx (reverse proxy + HTTPS)

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mvpmms
PORT=4000
JWT_SECRET=change-to-long-random-string
APP_BASE_URL=https://rankage.shop
CORS_ORIGINS=http://localhost:3000,https://rankage.shop,https://www.rankage.shop
G2BULK_API_KEY=your-g2bulk-key

# Email (optional — logs in dev if unset)
SMTP_HOST=smtp.example.com
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
SMTP_FROM=MVPMMSHOP <noreply@yourdomain.com>

NODE_ENV=production
```

### Frontend (`frontend/.env.production`)

```env
NEXT_PUBLIC_API_URL=https://api.rankage.shop
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

## Build & Deploy

```bash
# Backend
cd backend
npm ci
npx prisma db push
npm run db:seed
npm run build
pm2 start dist/main.js --name mvpmms-api

# Frontend
cd frontend
npm ci
npm run build
pm2 start npm --name mvpmms-web -- start
```

## Nginx + HTTPS

```nginx
server {
  listen 443 ssl;
  server_name rankage.shop www.rankage.shop;
  ssl_certificate /etc/letsencrypt/live/rankage.shop/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/rankage.shop/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}

server {
  listen 443 ssl;
  server_name api.rankage.shop;
  ssl_certificate /etc/letsencrypt/live/rankage.shop/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/rankage.shop/privkey.pem;

  client_max_body_size 5m;

  location = /uploads/payment-proof {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    client_max_body_size 5m;
  }

  location = /uploads/payment-proof-base64 {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    client_max_body_size 5m;
  }

  location /uploads/ {
    alias /var/www/mvpmms/backend/uploads/;
  }

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

Use Certbot for Let's Encrypt: `certbot --nginx -d rankage.shop -d www.rankage.shop -d api.rankage.shop`

## Backups

### PostgreSQL (daily cron)

```bash
pg_dump -U mvpmms mvpmms | gzip > /backups/mvpmms-$(date +%F).sql.gz
```

Keep 7–30 days; test restore monthly.

### Uploads folder

```bash
tar -czf /backups/uploads-$(date +%F).tar.gz /var/www/mvpmms/backend/uploads
```

## Security Checklist

- [ ] Change default admin password after seed
- [ ] Strong `JWT_SECRET` in production
- [ ] HTTPS only (redirect HTTP → HTTPS)
- [ ] Rate limiting enabled on auth/upload routes (built-in)
- [ ] File upload: JPG/PNG/WEBP/GIF only, max 3MB
- [ ] Firewall: allow 80, 443 only; PostgreSQL localhost only
- [ ] Optional: admin 2FA (future enhancement)

## Monitoring

- `pm2 logs mvpmms-api`
- `pm2 monit`
- Set up uptime checks on `/settings/shop` and frontend home

## Mobile App

Release builds use `https://api.rankage.shop` via `mobile/src/config/api.ts` (`__DEV__` uses local emulator URL).

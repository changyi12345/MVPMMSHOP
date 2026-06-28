#!/usr/bin/env bash
# Fix git pull conflicts on VPS, then deploy latest from GitHub.
# Preserves backend/.env and frontend/.env.production
#
# Run on VPS:
#   cd /var/www/mvpmms
#   bash deploy/vps-fix-pull-and-deploy.sh
#
# Or one-liner (before this file exists on server):
#   cd /var/www/mvpmms && cp backend/.env /tmp/mvpmms-backend.env.bak; cp frontend/.env.production /tmp/mvpmms-frontend.env.production.bak 2>/dev/null; git fetch origin main && git reset --hard origin/main && cp /tmp/mvpmms-backend.env.bak backend/.env; cp /tmp/mvpmms-frontend.env.production.bak frontend/.env.production 2>/dev/null; cp deploy/nginx-rankage.shop.conf /etc/nginx/sites-available/rankage.shop && nginx -t && systemctl reload nginx && bash deploy/vps-deploy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BACKEND_ENV_BAK="/tmp/mvpmms-backend.env.bak"
FRONTEND_ENV_BAK="/tmp/mvpmms-frontend.env.production.bak"

echo "==> Backup env files"
if [[ -f backend/.env ]]; then
  cp backend/.env "$BACKEND_ENV_BAK"
  echo "Saved backend/.env"
else
  echo "WARN: backend/.env missing"
fi
if [[ -f frontend/.env.production ]]; then
  cp frontend/.env.production "$FRONTEND_ENV_BAK"
  echo "Saved frontend/.env.production"
else
  echo "WARN: frontend/.env.production missing"
fi

echo ""
echo "==> Sync with GitHub (discard local file conflicts)"
git fetch origin main
git reset --hard origin/main

echo ""
echo "==> Restore env files"
if [[ -f "$BACKEND_ENV_BAK" ]]; then
  cp "$BACKEND_ENV_BAK" backend/.env
  chmod 600 backend/.env 2>/dev/null || true
fi
if [[ -f "$FRONTEND_ENV_BAK" ]]; then
  cp "$FRONTEND_ENV_BAK" frontend/.env.production
fi

echo ""
echo "==> Nginx config"
cp deploy/nginx-rankage.shop.conf /etc/nginx/sites-available/rankage.shop
nginx -t
systemctl reload nginx

echo ""
echo "==> Build + PM2"
bash deploy/vps-deploy.sh

echo ""
echo "==> Verify"
curl -sf http://127.0.0.1:4000/health | head -c 200; echo
curl -sfI http://127.0.0.1:3000/ | head -1
echo "Done — https://rankage.shop updated"

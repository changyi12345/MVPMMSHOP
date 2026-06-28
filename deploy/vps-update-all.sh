#!/usr/bin/env bash
# One-shot VPS update: pull latest code, refresh nginx, rebuild, restart PM2
# Run on VPS: bash deploy/vps-update-all.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Git pull"
git pull origin main

echo "==> Nginx config"
cp deploy/nginx-rankage.shop.conf /etc/nginx/sites-available/rankage.shop
nginx -t
systemctl reload nginx

echo "==> Build + PM2"
bash deploy/vps-deploy.sh

echo ""
echo "==> Verify"
curl -sf http://127.0.0.1:4000/health | head -c 200; echo
curl -sfI http://127.0.0.1:3000/ | head -1
echo "Done — https://rankage.shop updated"

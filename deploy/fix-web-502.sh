#!/usr/bin/env bash
# Fix rankage.shop 502 — frontend (Next.js on :3000) not running
# Run on VPS: bash deploy/fix-web-502.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REQUIRED_FILES=(
  frontend/components/HomeSection.tsx
  frontend/components/ShopIcon.tsx
  frontend/components/MobileTabBar.tsx
  frontend/components/BrandLogo.tsx
  frontend/lib/branding.ts
  frontend/components/PageLayout.tsx
)

echo "==> Check required frontend files"
missing=0
for f in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "MISSING: $f"
    missing=1
  fi
done
if [[ "$missing" -eq 1 ]]; then
  echo ""
  echo "Upload full frontend from PC first:"
  echo "  powershell -ExecutionPolicy Bypass -File deploy/upload-frontend-vps.ps1 -Rebuild"
  exit 1
fi
echo "OK — required files present"

echo ""
echo "==> PM2 status"
pm2 status || true

echo ""
echo "==> Port 3000 listening?"
if ss -tlnp 2>/dev/null | grep -q ':3000 '; then
  echo "OK — something is on port 3000"
else
  echo "NOT listening — rankage-web is down or crashed"
fi

echo ""
echo "==> Recent rankage-web logs"
pm2 logs rankage-web --lines 30 --nostream 2>/dev/null || true

echo ""
echo "==> Rebuild frontend"
cd frontend
if [[ ! -f .env.production ]]; then
  echo "Missing frontend/.env.production — copy deploy/frontend.env.vps.example"
  exit 1
fi
npm ci
npm run build

echo ""
echo "==> Restart rankage-web"
cd "$ROOT"
pm2 restart rankage-web || pm2 start deploy/ecosystem.config.cjs --only rankage-web
pm2 save

sleep 2

echo ""
echo "==> Verify local frontend"
if curl -sfI http://127.0.0.1:3000/ | head -1; then
  echo "Frontend OK — https://rankage.shop should work now"
else
  echo "Still failing — check: pm2 logs rankage-web --lines 80"
  exit 1
fi

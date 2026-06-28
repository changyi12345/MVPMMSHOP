#!/usr/bin/env bash
# MVPMMSHOP — build and (re)start on VPS
# Usage:
#   bash deploy/vps-deploy.sh          # update
#   bash deploy/vps-deploy.sh --first    # first deploy (+ db seed prompt)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

FIRST=false
if [[ "${1:-}" == "--first" ]]; then
  FIRST=true
fi

if [[ ! -f backend/.env ]]; then
  echo "Missing backend/.env — copy deploy/backend.env.vps.example"
  exit 1
fi

if [[ ! -f frontend/.env.production ]]; then
  echo "Missing frontend/.env.production — copy deploy/frontend.env.vps.example"
  exit 1
fi

echo "==> Backend"
cd backend
npm ci
npx prisma generate
npx prisma db push
if $FIRST; then
  read -r -p "Run db:seed (creates admin user)? [y/N] " ans
  if [[ "$ans" =~ ^[Yy]$ ]]; then
    npm run db:seed
  fi
fi
npm run build
mkdir -p uploads
cd ..

echo "==> Frontend"
cd frontend
npm ci
npm run build
cd ..

echo "==> PM2"
if pm2 describe rankage-api >/dev/null 2>&1; then
  pm2 restart deploy/ecosystem.config.cjs
else
  pm2 start deploy/ecosystem.config.cjs
fi
pm2 save

echo ""
echo "Apps running:"
pm2 status
echo ""
echo "Test locally on VPS:"
echo "  curl -s http://127.0.0.1:4000/health"
echo "  curl -sI http://127.0.0.1:3000/ | head -1"

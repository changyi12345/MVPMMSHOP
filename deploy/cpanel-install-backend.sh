#!/bin/bash
# Run from ~/mvpmms/backend after activating Node.js venv (see cPanel Node.js app page)
set -e
export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"

npm ci
npx prisma generate
npx prisma db push
npm run build
npm prune --omit=dev

echo "Backend ready — Restart Node.js app in cPanel (api.rankage.shop)"

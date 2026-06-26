#!/bin/bash
# Run from ~/mvpmms/frontend after activating Node.js venv
set -e
export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"

npm ci
npm run build
npm prune --omit=dev

echo "Frontend ready — Restart Node.js app in cPanel (rankage.shop)"

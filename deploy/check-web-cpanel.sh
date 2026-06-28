#!/bin/bash
# Run on cPanel after deploy-web.zip extract — diagnoses 503 / startup issues.
set -e
cd ~/public_html/rankage.shop
source ~/nodevenv/public_html/rankage.shop/20/bin/activate 2>/dev/null || true

echo "=== Files ==="
ls -la server.js package.json .env.production .next/BUILD_ID 2>&1 || true
echo ""
echo "=== node_modules symlink ==="
ls -la node_modules 2>&1 | head -3
echo ""
echo "=== next module ==="
node -e "console.log('next', require('next/package.json').version)" 2>&1 || echo "FAIL: cannot require next"
echo ""
echo "=== swc binary (Linux) ==="
ls node_modules/@next/swc-linux-x64-gnu 2>/dev/null || ls ~/nodevenv/public_html/rankage.shop/20/lib/node_modules/@next/swc-linux-x64-gnu 2>/dev/null || echo "WARN: swc-linux missing — npm install --omit=dev again"
echo ""
echo "=== Quick start test (port 3999, 5 sec) ==="
timeout 5 env PORT=3999 node server.js 2>&1 || true
echo ""
echo "=== lsnode processes ==="
ps aux | grep lsnode | grep ztkopszw | grep -v grep || echo "No lsnode running"
echo ""
echo "Done. If prepare() failed above, paste output. Then cPanel → Restart rankage.shop app."

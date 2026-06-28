#!/bin/bash
# Run on cPanel AFTER stopping both Node apps and waiting ~10 min.
# Usage: bash deploy/fix-503-cpanel.sh
set -e
USER="${USER:-ztkopszw}"
API_ROOT="/home/$USER/api.rankage.shop"
WEB_ROOT="/home/$USER/public_html/rankage.shop"

echo "=== MVPMMSHOP 503 diagnostic ==="
echo "User: $USER"
echo ""

echo "=== lsnode processes (should be 0 before Start in cPanel) ==="
ps aux | grep lsnode | grep "$USER" | grep -v grep || echo "(none)"
echo ""

echo "=== API .htaccess ==="
if [ -f "$API_ROOT/.htaccess" ] && [ -s "$API_ROOT/.htaccess" ]; then
  head -6 "$API_ROOT/.htaccess"
else
  echo "MISSING or EMPTY — paste deploy/htaccess-api.template into $API_ROOT/.htaccess"
fi
echo ""

echo "=== Web .htaccess ==="
if [ -f "$WEB_ROOT/.htaccess" ] && [ -s "$WEB_ROOT/.htaccess" ]; then
  head -6 "$WEB_ROOT/.htaccess"
else
  echo "MISSING or EMPTY — paste deploy/htaccess-web.template into $WEB_ROOT/.htaccess"
fi
echo ""

echo "=== API files ==="
ls -la "$API_ROOT/server.js" "$API_ROOT/dist/src/main.js" 2>&1 || true
echo ""

echo "=== Web files ==="
ls -la "$WEB_ROOT/server.js" "$WEB_ROOT/.next/BUILD_ID" 2>&1 || true
echo ""

echo "=== Web .next permissions sample ==="
ls -la "$WEB_ROOT/.next/static/chunks" 2>&1 | head -3 || echo "WARN: chunks missing"
echo ""

echo "=== Quick API start test (port 3998, 5 sec) ==="
cd "$API_ROOT" 2>/dev/null && timeout 5 env PORT=3998 NODE_ENV=production node server.js 2>&1 || true
echo ""

echo "=== Quick Web start test (port 3999, 5 sec) ==="
cd "$WEB_ROOT" 2>/dev/null && timeout 5 env PORT=3999 NODE_ENV=production node server.js 2>&1 || true
echo ""

echo "Done."
echo "Next: cPanel → Start api.rankage.shop → test /health"
echo "       cPanel → Start rankage.shop → test https://rankage.shop"

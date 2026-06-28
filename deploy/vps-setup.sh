#!/usr/bin/env bash
# MVPMMSHOP — VPS first-time server bootstrap (Ubuntu 22.04/24.04)
# Run as root or sudo user on a fresh VPS:
#   curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/deploy/vps-setup.sh | bash
# Or after uploading the repo:
#   sudo bash deploy/vps-setup.sh

set -euo pipefail

APP_DIR="/var/www/mvpmms"
DEPLOY_USER="${SUDO_USER:-${USER:-root}}"

echo "==> MVPMMSHOP VPS setup (Ubuntu)"
echo "    App dir: $APP_DIR"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Run with sudo: sudo bash deploy/vps-setup.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

npm install -g pm2

mkdir -p "$APP_DIR/backend/uploads"
chown -R "$DEPLOY_USER:$DEPLOY_USER" /var/www

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "Done. Next steps:"
echo "  1. Upload/clone project to $APP_DIR"
echo "  2. Create backend/.env and frontend/.env.production (see deploy/*.env.vps.example)"
echo "  3. Run: bash $APP_DIR/deploy/vps-deploy.sh --first"
echo "  4. Configure nginx + certbot (see deploy/VPS-SETUP-MM.md)"

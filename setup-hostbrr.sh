#!/usr/bin/env bash
# =============================================================================
#  HostBrr VPS Initial Server Provisioning Script
#  Prepares a clean Ubuntu/Debian HostBrr VPS for PolarGuard deployment.
#
#  Usage:
#    sudo bash setup-hostbrr.sh
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

[[ $EUID -ne 0 ]] && error "This script must be run as root: sudo bash setup-hostbrr.sh"

echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}       HostBrr VPS Setup — PolarGuard Environment         ${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo ""

# ─── 1. Update OS packages ──────────────────────────────────────────────────
info "Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
success "System packages updated"

# ─── 2. Install essential dependencies ──────────────────────────────────────
info "Installing essential utilities..."
apt-get install -y curl wget git ufw software-properties-common ca-certificates gnupg build-essential
success "Utilities installed"

# ─── 3. Install Node.js 20 LTS ──────────────────────────────────────────────
if command -v node &>/dev/null && [[ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -ge 18 ]]; then
  success "Node.js already installed: $(node -v)"
else
  info "Installing Node.js 20 LTS via NodeSource..."
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --yes
  NODE_MAJOR=20
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
  apt-get update -y
  apt-get install -y nodejs
  success "Node.js installed: $(node -v), npm: $(npm -v)"
fi

# ─── 4. Install PM2 process manager ─────────────────────────────────────────
if command -v pm2 &>/dev/null; then
  success "PM2 already installed: $(pm2 -v)"
else
  info "Installing PM2 globally..."
  npm install -g pm2
  pm2 startup systemd -u root --hp /root || true
  success "PM2 installed: $(pm2 -v)"
fi

# ─── 5. Install Nginx ───────────────────────────────────────────────────────
if command -v nginx &>/dev/null; then
  success "Nginx already installed: $(nginx -v 2>&1)"
else
  info "Installing Nginx..."
  apt-get install -y nginx
  systemctl enable nginx
  systemctl start nginx
  success "Nginx installed and running"
fi

# ─── 6. Install Certbot (Let's Encrypt SSL) ──────────────────────────────────
if command -v certbot &>/dev/null; then
  success "Certbot already installed"
else
  info "Installing Certbot and Nginx plugin..."
  apt-get install -y certbot python3-certbot-nginx
  success "Certbot installed"
fi

# ─── 7. Configure Firewall (UFW) ────────────────────────────────────────────
info "Configuring UFW firewall (SSH, HTTP, HTTPS)..."
ufw allow OpenSSH || ufw allow 22/tcp
ufw allow 'Nginx Full' || (ufw allow 80/tcp && ufw allow 443/tcp)
echo "y" | ufw enable || true
success "Firewall active"

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  HostBrr VPS Preparation Complete!                      ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next step: Run the deployment script:"
echo "  sudo bash deploy.sh --domain yourdomain.com --email admin@yourdomain.com"
echo ""

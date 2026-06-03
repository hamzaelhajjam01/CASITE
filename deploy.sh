#!/usr/bin/env bash
# =============================================================================
#  PolarGuard — Production Deployment Script
#
#  Usage:
#    sudo bash deploy.sh --domain example.com --email admin@example.com
#    sudo bash deploy.sh --domain example.com --email admin@example.com \
#                        --frontend-port 3001 --backend-port 3002 \
#                        --app-name polarguard --skip-ssl
#
#  Assumes already installed on the server:
#    nginx, certbot (python3-certbot-nginx), pm2, node >= 18
#
#  Multi-domain safe:
#    - Writes only /etc/nginx/sites-available/<domain> — never touches others
#    - PM2 app is identified by --app-name, no conflict with other processes
# =============================================================================
set -euo pipefail

# ─── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ─── Defaults ────────────────────────────────────────────────────────────────
DOMAIN="Polarguardinsurance.com"
EMAIL="contact@Polarguardinsurance.com"
BACKEND_PORT=3222
SKIP_SSL=false
APP_NAME="polarguard"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/app"
SERVER_DIR="$SCRIPT_DIR/server"

# ─── Argument parsing ────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)        DOMAIN="$2";        shift 2 ;;
    --email)         EMAIL="$2";         shift 2 ;;
    --backend-port)  BACKEND_PORT="$2";  shift 2 ;;
    --app-name)      APP_NAME="$2";      shift 2 ;;
    --skip-ssl)      SKIP_SSL=true;      shift   ;;
    *) error "Unknown argument: $1" ;;
  esac
done

[[ -z "$DOMAIN" ]] && error "Required: --domain <yourdomain.com>"
[[ -z "$EMAIL"  ]] && error "Required: --email <admin@yourdomain.com>"
[[ $EUID -ne 0  ]] && error "Run as root:  sudo bash deploy.sh ..."

# Quick sanity-check — fail early with a clear message
command -v nginx   &>/dev/null || error "nginx not found. Install it first."
command -v certbot &>/dev/null || error "certbot not found. Install it first."
command -v pm2     &>/dev/null || error "pm2 not found. Install it first (npm i -g pm2)."
command -v node    &>/dev/null || error "node not found."

DOMAIN_LOWER="${DOMAIN,,}"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
NGINX_LINK="/etc/nginx/sites-enabled/${DOMAIN}"

info "Domain:       ${DOMAIN}"
info "Backend port: ${BACKEND_PORT}"
info "PM2 app name: ${APP_NAME}"
info "SSL:          $( [[ $SKIP_SSL == true ]] && echo 'skipped' || echo 'enabled' )"
echo ""

# ─── 1. Build frontend ───────────────────────────────────────────────────────
info "Building frontend…"
cd "$APP_DIR"
npm ci --prefer-offline

# Set VITE_API_URL for production — create or update the single line
ENV_FILE="$APP_DIR/.env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "VITE_API_URL=https://${DOMAIN}/api" > "$ENV_FILE"
  success "Created $ENV_FILE"
elif grep -q "^VITE_API_URL=" "$ENV_FILE"; then
  sed -i "s|^VITE_API_URL=.*|VITE_API_URL=https://${DOMAIN}/api|" "$ENV_FILE"
  success "Updated VITE_API_URL in $ENV_FILE"
else
  echo "VITE_API_URL=https://${DOMAIN}/api" >> "$ENV_FILE"
  success "Appended VITE_API_URL to $ENV_FILE"
fi

npm run build
success "Frontend built → $APP_DIR/dist"

# ─── 2. Build backend ────────────────────────────────────────────────────────
info "Building backend…"
cd "$SERVER_DIR"
npm ci --prefer-offline
npm run build
success "Backend built → $SERVER_DIR/dist"

# ─── 3. Update backend .env ──────────────────────────────────────────────────
info "Updating server/.env for production…"

_set_env() {
  local key="$1" val="$2" file="$SERVER_DIR/.env"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$file"
  else
    echo "${key}=${val}" >> "$file"
  fi
}

_set_env PORT          "$BACKEND_PORT"
_set_env CORS_ORIGIN   "https://${DOMAIN}"
success "server/.env updated"

# ─── 4. Nginx — write isolated server block ──────────────────────────────────
info "Writing Nginx config → $NGINX_CONF"

if [[ "$SKIP_SSL" == true ]]; then

  # ── HTTP-only (staging / no cert yet) ──
  cat > "$NGINX_CONF" <<NGINX
# PolarGuard — ${DOMAIN}  [HTTP only — no SSL]
# Managed by deploy.sh — re-run to update
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # API → Express backend
    location /api/ {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
        client_max_body_size 20M;
    }

    # Frontend — Vite static build (SPA)
    root  ${APP_DIR}/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
NGINX

else

  # ── Step 1: bare HTTP block so Certbot can complete its ACME challenge ──
  cat > "$NGINX_CONF" <<NGINX
# PolarGuard — ${DOMAIN}  [temporary HTTP — SSL pending]
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    location / {
        return 301 https://\$host\$request_uri;
    }
}
NGINX

fi

# Enable site (idempotent symlink)
[[ ! -L "$NGINX_LINK" ]] && ln -sf "$NGINX_CONF" "$NGINX_LINK"

nginx -t
systemctl reload nginx
success "Nginx reloaded"

# ─── 5. SSL certificate ───────────────────────────────────────────────────────
if [[ "$SKIP_SSL" == false ]]; then
  info "Obtaining / renewing SSL certificate for ${DOMAIN}…"

  certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email  "$EMAIL" \
    --domains "${DOMAIN_LOWER},www.${DOMAIN_LOWER}" \
    --keep-until-expiring

  success "Certificate ready"

  # ── Step 2: replace with full HTTPS config ──
  cat > "$NGINX_CONF" <<NGINX
# PolarGuard — ${DOMAIN}
# Managed by deploy.sh — re-run to update

# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${DOMAIN} www.${DOMAIN};

    # TLS (managed by Certbot)
    ssl_certificate     /etc/letsencrypt/live/${DOMAIN_LOWER}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_LOWER}/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options        "SAMEORIGIN"    always;
    add_header X-Content-Type-Options "nosniff"       always;
    add_header Referrer-Policy        "strict-origin"  always;

    # API → Express backend on port ${BACKEND_PORT}
    location /api/ {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
        client_max_body_size 20M;
    }

    # Frontend — Vite static build (SPA)
    root  ${APP_DIR}/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache hashed static assets
    location ~* \.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
NGINX

  nginx -t
  systemctl reload nginx
  success "Nginx reloaded (HTTPS)"
fi

# ─── 6. PM2 — start or zero-downtime reload ──────────────────────────────────
info "Deploying backend via PM2 (name: ${APP_NAME})…"
cd "$SERVER_DIR"

if pm2 describe "$APP_NAME" &>/dev/null; then
  pm2 reload "$APP_NAME" --update-env
  success "PM2 '${APP_NAME}' reloaded (zero-downtime)"
else
  pm2 start dist/index.js \
    --name "$APP_NAME" \
    --cwd  "$SERVER_DIR" \
    --log  "/var/log/${APP_NAME}.log" \
    --time
  success "PM2 '${APP_NAME}' started"
fi

pm2 save
success "PM2 process list saved"

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  PolarGuard deployed!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
if [[ "$SKIP_SSL" == false ]]; then
  echo -e "  Site:    https://${DOMAIN}"
  echo -e "  API:     https://${DOMAIN}/api/health"
else
  echo -e "  Site:    http://${DOMAIN}"
  echo -e "  API:     http://${DOMAIN}/api/health"
fi
echo -e "  PM2:     pm2 status  /  pm2 logs ${APP_NAME}"
echo -e "  Nginx:   /etc/nginx/sites-available/${DOMAIN}"
[[ "$SKIP_SSL" == false ]] && echo -e "  Certs:   /etc/letsencrypt/live/${DOMAIN_LOWER}/"
echo ""

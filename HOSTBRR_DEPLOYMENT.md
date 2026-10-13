# HostBrr VPS Deployment & Migration Guide

This guide walks you through deploying **PolarGuard** (Frontend Vite SPA + Express Backend API + MongoDB Atlas + IMAP & Telegram listeners) on a **HostBrr VPS**.

---

## 1. HostBrr VPS Specifications & OS

When ordering or re-installing your VPS in the **HostBrr Client Area**:
- **Operating System:** **Ubuntu 22.04 LTS** or **Ubuntu 24.04 LTS** (or Debian 12)
- **Minimum Specs:** 1 vCPU, 1GB RAM (2GB RAM recommended)
- **Swap:** 2GB Swap recommended (the setup script or commands below can configure this).

---

## 2. Point Your Domain DNS to HostBrr

Before issuing SSL certificates, update your DNS records at your domain registrar (e.g., Namecheap, Cloudflare, GoDaddy):

| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (or blank) | `<Your_HostBrr_VPS_IP>` | Auto / 300s |
| **A** | `www` | `<Your_HostBrr_VPS_IP>` | Auto / 300s |

> [!NOTE]
> DNS propagation typically takes 5–30 minutes. Make sure the domain resolves to your HostBrr IP before running SSL certification.

---

## 3. Connect to your HostBrr VPS via SSH

From PowerShell, Terminal, or PuTTY:

```bash
ssh root@<YOUR_HOSTBRR_VPS_IP>
```

---

## 4. (Recommended) Add 2GB Swap Memory

If your VPS has 1GB or 2GB RAM, adding a swap file prevents build processes (Vite/TypeScript) from running out of memory:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

---

## 5. Clone the Repository on HostBrr

```bash
# Create directory and clone
mkdir -p /var/www
cd /var/www
git clone https://github.com/samacyc/CASITE.git polarguard
cd /var/www/polarguard
```

---

## 6. Run the HostBrr Initialization Script

We have provided `setup-hostbrr.sh` which automatically installs Node.js 20 LTS, npm, PM2, Nginx, Certbot, build utilities, and configures UFW firewall:

```bash
chmod +x setup-hostbrr.sh deploy.sh
sudo bash setup-hostbrr.sh
```

---

## 7. Configure Production Secrets (`server/.env`)

Create or update `/var/www/polarguard/server/.env` with your real secrets:

```bash
nano /var/www/polarguard/server/.env
```

Ensure the following variables are filled:
```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=polarguard
JWT_SECRET=your_secure_random_jwt_secret_at_least_32_characters
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=admin@polarguardinsurance.com
ADMIN_PASSWORD_HASH=<your_bcrypt_hash>
CORS_ORIGIN=https://polarguardinsurance.com

# Telegram Bot
TELEGRAM_BOT_TOKEN=8952394310:...
TELEGRAM_CHAT_ID=-1003584220577

# AI Models
GEMINI_API_KEY=...
XAI_API_KEY=...

# Outgoing Mail (SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@polarguardbrokerage.ca
SMTP_PASS=...
FROM_NAME="PolarGuard Customer Operations"
FROM_EMAIL=contact@polarguardbrokerage.ca

# Incoming Mail (IMAP)
IMAP_HOST=imap.hostinger.com
IMAP_PORT=993
IMAP_USER=contact@polarguardbrokerage.ca
IMAP_PASS=...
```

Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit `nano`.

---

## 8. Run Production Deployment

Run `deploy.sh` with your domain and email:

```bash
sudo bash deploy.sh --domain polarguardinsurance.com --email admin@polarguardinsurance.com
```

### What this script executes automatically:
1. Installs frontend dependencies and builds the Vite SPA into `app/dist`.
2. Configures `app/.env.production` (`VITE_API_URL=https://<domain>/api`).
3. Installs backend dependencies and compiles TypeScript into `server/dist`.
4. Configures isolated Nginx reverse proxy configuration at `/etc/nginx/sites-available/<domain>`.
5. Requests and configures automated SSL certificate via Let's Encrypt Certbot.
6. Starts or performs zero-downtime reload of the backend Express API via PM2 (`polarguard`).
7. Configures static asset caching, security headers, and reverse proxy timeouts.

---

## 9. Useful Operations & Commands

### Check Application Status:
```bash
pm2 status
```

### View Live Backend Logs (API, IMAP listener, Telegram listener):
```bash
pm2 logs polarguard
```

### Restart Backend Service:
```bash
pm2 restart polarguard
```

### Test Nginx and Reload:
```bash
nginx -t
systemctl reload nginx
```

### Subsequent Updates (Deploying New Git Commits):
```bash
cd /var/www/polarguard
git pull
sudo bash deploy.sh --domain polarguardinsurance.com --email admin@polarguardinsurance.com
```

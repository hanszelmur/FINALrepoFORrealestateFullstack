# Deployment Guide

Complete guide for deploying the Real Estate Management System to production.

## Prerequisites

Before deployment, ensure you have:

- Ubuntu 20.04 or newer server
- MySQL 8.0+ installed and configured
- Node.js 18+ with npm
- Domain name with DNS configured
- SSL certificate (or Let's Encrypt)
- Minimum 2GB RAM, 2 CPU cores
- 20GB disk space

## Pre-Deployment Checklist

### Security Checklist ✅

- [ ] **Change all default passwords**
  - Admin password (not `Admin123!@#`)
  - MySQL root password
  - Agent passwords from seed data

- [ ] **Environment variables**
  - [ ] Set strong `JWT_SECRET` (min 32 characters, random)
  - [ ] Set strong `CSRF_SECRET` (min 32 characters, random)
  - [ ] Configure `DB_PASSWORD` (never leave empty)
  - [ ] Set production `CORS_ORIGIN` (your domain)
  - [ ] Set `NODE_ENV=production`

- [ ] **Database security**
  - [ ] Create dedicated database user (not root)
  - [ ] Grant minimal required permissions
  - [ ] Enable MySQL audit logging
  - [ ] Configure firewall to block external DB access

- [ ] **Server hardening**
  - [ ] Configure UFW firewall
  - [ ] Disable root SSH login
  - [ ] Set up SSH key authentication
  - [ ] Install fail2ban
  - [ ] Keep system updated

- [ ] **Application security**
  - [ ] Review all rate limits
  - [ ] Verify CORS configuration
  - [ ] Test JWT expiration (7 days recommended)
  - [ ] Verify file upload restrictions
  - [ ] Test CSRF protection

## Step-by-Step Deployment

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Install PM2 globally
sudo npm install -g pm2

# Install nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Database Configuration

```bash
# Login to MySQL
sudo mysql

# Create dedicated database user
CREATE USER 'realestate_app'@'localhost' IDENTIFIED BY 'your_strong_password_here';

# Create database
CREATE DATABASE real_estate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON real_estate_db.* TO 'realestate_app'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### Step 3: Application Deployment

```bash
# Create application user
sudo useradd -m -s /bin/bash realestate
sudo su - realestate

# Clone repository
git clone https://github.com/yourusername/FINALrepoFORrealestateFullstack.git
cd FINALrepoFORrealestateFullstack

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Production .env file:**
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=realestate_app
DB_PASSWORD=your_strong_password_here
DB_NAME=real_estate_db

# JWT (Generate with: openssl rand -base64 32)
JWT_SECRET=your_32_char_random_secret_change_this_in_production
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads/properties

# CSRF (Generate with: openssl rand -base64 32)
CSRF_SECRET=your_csrf_secret_change_this_in_production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://yourdomain.com

# Admin Email (for initial setup)
ADMIN_EMAIL=admin@yourdomain.com
```

```bash
# Initialize database
mysql -u realestate_app -p real_estate_db < database/schema.sql

# Load seed data (optional for production, recommended for testing)
# mysql -u realestate_app -p real_estate_db < database/seed.sql

# Build application
npm run build

# Create upload directory
mkdir -p uploads/properties

# Set permissions
chmod 755 uploads
chmod 755 uploads/properties

# Exit to main user
exit
```

### Step 4: PM2 Configuration

```bash
# Create PM2 ecosystem file
cd /home/realestate/FINALrepoFORrealestateFullstack
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'realestate-api',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    restart_delay: 4000
  }]
};
```

```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs

# Monitor application
pm2 monit
```

### Step 5: Nginx Configuration

```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/realestate
```

**Nginx configuration:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Max upload size
    client_max_body_size 10M;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security.txt (optional but recommended)
    location /.well-known/security.txt {
        return 200 "Contact: security@yourdomain.com\nExpires: 2025-12-31T23:59:59Z\n";
        add_header Content-Type text/plain;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/realestate /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### Step 6: SSL Certificate

```bash
# Obtain SSL certificate with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts, certbot will automatically configure nginx

# Test automatic renewal
sudo certbot renew --dry-run

# Set up automatic renewal (already configured, just verify)
sudo systemctl status certbot.timer
```

### Step 7: Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny direct access to Node.js port from outside
# (nginx will proxy requests)

# Check status
sudo ufw status verbose
```

### Step 8: Create Initial Admin

Since there's no agent creation UI, create the admin account:

```bash
# Login to database
mysql -u realestate_app -p real_estate_db

# Generate bcrypt hash for password (use Node.js)
node
> const bcrypt = require('bcrypt');
> bcrypt.hashSync('YourSecureAdminPassword', 10);
# Copy the hash

# Insert admin user
INSERT INTO users (email, password_hash, full_name, role, phone, status)
VALUES (
    'admin@yourdomain.com',
    '$2b$10$...', -- Paste your hash here
    'System Administrator',
    'admin',
    '+639171234567',
    'active'
);

EXIT;
```

## Post-Deployment Tasks

### Step 9: Monitoring Setup

```bash
# Install monitoring tools
sudo npm install -g pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# View logs
pm2 logs realestate-api

# Monitor resources
pm2 monit
```

### Step 10: Backup Strategy

Create backup script `/home/realestate/backup.sh`:

```bash
#!/bin/bash

# Backup directory
BACKUP_DIR="/home/realestate/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u realestate_app -p'your_password' real_estate_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Application files backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /home/realestate/FINALrepoFORrealestateFullstack/uploads

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /home/realestate/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/realestate/backup.sh
```

### Step 11: Health Checks

```bash
# Test health endpoint
curl https://yourdomain.com/health

# Test authentication
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"YourPassword"}'

# Monitor PM2
pm2 status

# Check nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check application logs
pm2 logs realestate-api
```

## Maintenance

### Daily Tasks
- Check PM2 status: `pm2 status`
- Review error logs: `pm2 logs realestate-api --err`
- Monitor disk space: `df -h`

### Weekly Tasks
- Review application logs for errors
- Check backup completion
- Monitor database size
- Review failed login attempts

### Monthly Tasks
- Update system packages: `sudo apt update && sudo apt upgrade`
- Review and optimize database
- Test backup restoration
- Review security logs
- Update SSL certificate (automated)

### Update Application

```bash
cd /home/realestate/FINALrepoFORrealestateFullstack

# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Rebuild
npm run build

# Restart application
pm2 restart realestate-api

# Check status
pm2 status
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs realestate-api --err

# Check database connection
mysql -u realestate_app -p real_estate_db -e "SELECT 1"

# Verify .env file
cat .env | grep -v PASSWORD

# Check port availability
sudo netstat -tlnp | grep 3000
```

### Database Connection Errors

```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u realestate_app -p -e "USE real_estate_db; SHOW TABLES;"

# Review MySQL error log
sudo tail -f /var/log/mysql/error.log
```

### Nginx Errors

```bash
# Check nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Review error log
sudo tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Rollback Procedure

If deployment fails:

```bash
# Stop application
pm2 stop realestate-api

# Restore database backup
gunzip < /home/realestate/backups/db_YYYYMMDD_HHMMSS.sql.gz | mysql -u realestate_app -p real_estate_db

# Restore application files
cd /home/realestate
tar -xzf backups/app_YYYYMMDD_HHMMSS.tar.gz

# Restart application
pm2 restart realestate-api
```

## Security Incident Response

If security breach detected:

1. **Immediate Actions**
   - Stop application: `pm2 stop realestate-api`
   - Block attacker IP: `sudo ufw deny from <IP>`
   - Rotate JWT secret in `.env`
   - Change all passwords

2. **Investigation**
   - Review application logs: `pm2 logs`
   - Review nginx access logs: `sudo cat /var/log/nginx/access.log`
   - Review MySQL audit logs
   - Check for unauthorized users in database

3. **Recovery**
   - Restore from backup if data compromised
   - Update all dependencies: `npm update`
   - Rebuild application: `npm run build`
   - Restart with new secrets: `pm2 restart realestate-api`

4. **Post-Incident**
   - Document incident
   - Update security measures
   - Notify affected users if needed

## Support

For deployment issues:
- Check logs first: `pm2 logs realestate-api`
- Review this guide thoroughly
- Check GitHub issues
- Contact system administrator

---

**Last Updated:** December 2025

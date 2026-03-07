# nginx Configuration Guide

This guide shows how to configure nginx to proxy requests to the Intelligent Learning Platform.

## Architecture

```
Internet → nginx:443 (SSL) → /intelligent-learning/* → Backend:8025 → React App + API
```

## Full nginx Configuration

Create `/etc/nginx/sites-available/intelligent-learning`:

```nginx
server {
    listen 443 ssl http2;
    server_name python.sicsglobal.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/python.sicsglobal.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/python.sicsglobal.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Intelligent Learning Platform
    location /intelligent-learning/ {
        # Strip the /intelligent-learning prefix when proxying
        rewrite ^/intelligent-learning/(.*) /$1 break;
        
        proxy_pass http://localhost:8025;
        
        # Proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Path $request_uri;
        
        # WebSocket support (if needed for future features)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_cache off;
    }

    # Redirect root to intelligent-learning (optional)
    location = / {
        return 301 /intelligent-learning/;
    }

    # Health check endpoint for monitoring
    location = /intelligent-learning-health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name python.sicsglobal.com;
    
    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all other HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

## Setup Steps

### 1. Install nginx (if not installed)

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d python.sicsglobal.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### 3. Enable Configuration

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/intelligent-learning /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4. Verify Configuration

```bash
# Check nginx status
sudo systemctl status nginx

# Test HTTPS
curl -I https://python.sicsglobal.com/intelligent-learning/

# Test health check
curl https://python.sicsglobal.com/intelligent-learning-health
```

## Alternative: Subdomain Setup

If you prefer using a subdomain instead:

```nginx
server {
    listen 443 ssl http2;
    server_name learn.python.sicsglobal.com;

    ssl_certificate /etc/letsencrypt/live/learn.python.sicsglobal.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/learn.python.sicsglobal.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8025;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

With this setup:
- Frontend base path would be `/` instead of `/intelligent-learning/`
- Access at: `https://learn.python.sicsglobal.com/`

## Troubleshooting

### 502 Bad Gateway

```bash
# Check if backend is running
docker ps | grep ilp_prod

# Check backend logs
docker logs ilp_prod

# Test backend directly
curl http://localhost:8025/
curl http://localhost:8025/api/health
```

### 404 Not Found

```bash
# Check nginx configuration
sudo nginx -t

# Check location block matches
# Verify rewrite rule is correct
```

### SSL Issues

```bash
# Test SSL
curl -I https://python.sicsglobal.com/intelligent-learning/

# Check certificate expiry
sudo certbot certificates

# Renew if needed
sudo certbot renew
```

### Connection Refused

```bash
# Check if nginx is running
sudo systemctl status nginx

# Check if backend port is listening
sudo netstat -tlnp | grep 8025

# Check firewall
sudo ufw status
sudo ufw allow 443/tcp
```

## Performance Tuning

For high traffic, add to the location block:

```nginx
# Compression
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

# Caching for static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
    proxy_pass http://localhost:8025;
    proxy_set_header Host $host;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## Monitoring

### Access Logs

```bash
# View real-time logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log

# Analyze traffic
sudo goaccess /var/log/nginx/access.log
```

### Health Checks

Add to your monitoring system:

```bash
# Simple health check
curl -f https://python.sicsglobal.com/intelligent-learning-health

# Full application check
curl -f https://python.sicsglobal.com/intelligent-learning/api/health/ready
```

## Security Best Practices

1. **Keep nginx updated**: `sudo apt update && sudo apt upgrade nginx`
2. **Use strong SSL**: Only TLSv1.2 and TLSv1.3
3. **Enable HSTS**: Already in configuration above
4. **Rate limiting**: Add if experiencing abuse
5. **Firewall**: Only allow ports 80, 443

```bash
# Example rate limiting
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

# Add to location block:
limit_req zone=one burst=20 nodelay;
```

---

For more help, see:
- nginx docs: https://nginx.org/en/docs/
- Certbot docs: https://certbot.eff.org/

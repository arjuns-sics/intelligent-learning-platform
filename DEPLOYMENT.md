# Intelligent Learning Platform - Production Deployment

Full-stack deployment guide for the Intelligent Learning Platform.

## Architecture

- **Frontend**: React 19 + Vite (built as static files)
- **Backend**: Node.js 22 (Express.js) - serves frontend at `/`
- **Database**: MongoDB
- **Port**: 8025
- **Container Names**: `ilp_prod`, `ilp_mongo_prod`
- **URL**: `https://python.sicsglobal.com/intelligent-learning`

## How It Works

```
User → nginx (port 443) → /intelligent-learning/* → Backend (port 8025)
                                                    ├── /api/* → API routes
                                                    └── /* → React app
```

**nginx handles**:
- SSL termination
- Routing `/intelligent-learning/*` to backend
- Path prefix stripping

**Backend handles**:
- Serving React app at root `/`
- API endpoints at `/api/*`
- SPA fallback routing

## Project Structure

```
intelligent-learning-platform/
├── frontend/              # React application
│   ├── dist/             # Built static files (deployed)
│   └── src/
├── backend/              # Express API
│   ├── src/
│   ├── uploads/          # User uploads
│   ├── static/           # Frontend build (mounted)
│   └── docker-compose.prod.yml
└── .github/workflows/
    └── deploy.yml        # GitHub Actions workflow
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Required
MONGODB_URI=mongodb://mongo:27017/ilp_db
JWT_SECRET=<generate-strong-secret-min-32-chars>
JWT_EXPIRES_IN=1d
NODE_ENV=production
CORS_ORIGIN=https://python.sicsglobal.com
OPENROUTER_API_KEY=<your-openrouter-key>
STATIC_PATH=/app/static

# Optional
UPLOAD_DIR=/app/uploads/
```

## Automated Deployment (GitHub Actions)

### 1. Configure GitHub Secrets

Go to your repository Settings → Secrets and variables → Actions:

```
SERVER_HOST=your.server.ip.address
SERVER_USERNAME=your-server-username
SERVER_PASSWORD=your-server-password
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 2. Push to Deploy

```bash
git add .
git commit -m "Deploy new version"
git push origin main
```

GitHub Actions will automatically:
1. Build the frontend (`npm run build`)
2. Copy frontend `dist/` and backend files to server
3. Build and start Docker containers
4. Run health checks on both API and frontend
5. Create backups and cleanup old ones

## Manual Deployment

### 1. Initial Server Setup

```bash
# SSH to server
ssh user@your.server.ip

# Create directories
sudo mkdir -p /var/www/python.sicsglobal.com/ilp
sudo chown -R $USER:$USER /var/www/python.sicsglobal.com/ilp
cd /var/www/python.sicsglobal.com/ilp

# Create subdirectories
mkdir -p uploads backups mongo_backups current static
```

### 2. Build Frontend Locally

```bash
cd frontend
npm install
npm run build
```

### 3. Copy Files to Server

```bash
# From project root
scp -r backend/* user@server:/var/www/python.sicsglobal.com/ilp/current/
scp -r frontend/dist/* user@server:/var/www/python.sicsglobal.com/ilp/current/static/
```

### 4. Configure Environment

```bash
# On server
cd /var/www/python.sicsglobal.com/ilp/current
cp .env.production.example .env
nano .env  # Edit with production values
chmod 600 .env
```

### 5. Deploy with Docker

```bash
cd /var/www/python.sicsglobal.com/ilp/current

# Build and start
docker compose -p ilp_prod -f docker-compose.prod.yml up -d --build

# Check status
docker ps

# View logs
docker logs -f ilp_prod

# Test API
curl http://localhost:8025/api/health

# Test Frontend
curl http://localhost:8025/intelligent-learning/
```

## Access URLs

- **Application**: `https://python.sicsglobal.com/intelligent-learning`
- **API Health**: `https://python.sicsglobal.com/intelligent-learning/api/health`
- **API Root**: `https://python.sicsglobal.com/intelligent-learning/api`

## Backup & Restore

### Manual Backup

```bash
cd /var/www/python.sicsglobal.com/ilp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup files
tar -czf backups/backup_$TIMESTAMP.tar.gz current/ uploads/ .env

# Backup database
docker exec ilp_mongo_prod mongodump --archive --gzip --db ilp_db > mongo_backups/mongo_backup_$TIMESTAMP.gz
```

### Restore from Backup

```bash
cd /var/www/python.sicsglobal.com/ilp

# Stop containers
docker compose -p ilp_prod -f docker-compose.prod.yml down

# Restore files
rm -rf current/*
tar -xzf backups/backup_20260307_120000.tar.gz -C .

# Restore database
docker compose -p ilp_prod -f docker-compose.prod.yml up -d mongo
sleep 10
docker exec -i ilp_mongo_prod mongorestore --archive --gzip --drop < mongo_backups/mongo_backup_20260307_120000.gz

# Restart
cd current
docker compose -p ilp_prod -f docker-compose.prod.yml up -d
```

## Monitoring

### Container Status

```bash
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Logs

```bash
# Backend logs
docker logs -f ilp_prod

# MongoDB logs
docker logs -f ilp_mongo_prod

# Last 100 lines
docker logs --tail 100 ilp_prod
```

### Health Checks

```bash
# API health
curl http://localhost:8025/api/health

# Frontend health
curl http://localhost:8025/intelligent-learning/

# Detailed health
curl http://localhost:8025/api/health/ready
```

## Troubleshooting

### Frontend Not Loading

1. Check static files exist:
```bash
ls -la /var/www/python.sicsglobal.com/ilp/current/static/
```

2. Verify build has correct base path:
```bash
grep -r "intelligent-learning" /var/www/python.sicsglobal.com/ilp/current/static/
```

3. Check nginx/reverse proxy configuration (if used)

### API Not Responding

1. Check backend logs:
```bash
docker logs ilp_prod
```

2. Verify environment variables:
```bash
docker exec ilp_prod env | grep -E "MONGO|JWT|PORT"
```

3. Test database connection:
```bash
docker exec ilp_mongo_prod mongosh --eval "db.stats()"
```

### Build Issues

1. Clear npm cache and rebuild:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

2. Check Node.js version:
```bash
node --version  # Should be 20+
```

## Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters
3. **Restrict CORS origins** - Only allow `https://python.sicsglobal.com`
4. **Regular backups** - Automated via GitHub Actions (keeps last 5)
5. **Keep containers updated** - Monitor for security patches
6. **HTTPS required** - Configure SSL on your reverse proxy

## Reverse Proxy Configuration (Optional)

If using Nginx:

```nginx
server {
    listen 443 ssl;
    server_name python.sicsglobal.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /intelligent-learning/ {
        proxy_pass http://localhost:8025/intelligent-learning/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /intelligent-learning/api/ {
        proxy_pass http://localhost:8025/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Reverse Proxy Configuration (Required)

**nginx configuration** for `python.sicsglobal.com`:

```nginx
server {
    listen 443 ssl;
    server_name python.sicsglobal.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Intelligent Learning Platform
    location /intelligent-learning/ {
        proxy_pass http://localhost:8025/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # API routes (optional - can go through same proxy)
    location /intelligent-learning/api/ {
        proxy_pass http://localhost:8025/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**After configuring nginx**:
```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Test access
curl -I https://python.sicsglobal.com/intelligent-learning/
```

## Scaling

For higher traffic:

1. **Increase MongoDB resources** in `docker-compose.prod.yml`
2. **Add Redis** for session caching
3. **Enable MongoDB replication** for high availability
4. **Use CDN** for static assets

## Support

For issues:
- Check logs: `docker logs ilp_prod`
- Review health: `curl http://localhost:8025/api/health`
- See documentation: `backend/DEPLOYMENT.md`

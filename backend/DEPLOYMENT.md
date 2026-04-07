# Intelligent Learning Platform - Backend Deployment

This guide covers deploying the ILP backend using Docker Compose in production.

## Architecture

- **Backend**: Node.js 22 (Express.js)
- **Database**: MongoDB
- **Port**: 8021
- **Container Names**: `ilp_backend_prod`, `ilp_mongo_prod`

## Prerequisites

- Docker & Docker Compose installed on server
- Server with port 8021 open
- GitHub repository with push access

## Environment Variables

Create a `.env` file in the backend directory with:

```env
# Required
MONGODB_URI=mongodb://mongo:27017/ilp_db
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=1d
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
OPENROUTER_API_KEY=<your-openrouter-key>

# Optional
UPLOAD_DIR=/app/uploads/
```

## Manual Deployment

### 1. Initial Setup

```bash
# Create directories
sudo mkdir -p /var/www/python.sicsglobal.com/ilp_backend
sudo chown -R $USER:$USER /var/www/python.sicsglobal.com/ilp_backend
cd /var/www/python.sicsglobal.com/ilp_backend

# Create subdirectories
mkdir -p uploads backups mongo_backups current
```

### 2. Copy Files

```bash
# Copy backend files to current directory
# (via SCP or git clone)
```

### 3. Configure Environment

```bash
cd current
cp .env.production.example .env
nano .env  # Edit with your values
chmod 600 .env
```

### 4. Deploy with Docker

```bash
# Build and start containers
docker compose -p ilp_backend_prod -f docker-compose.prod.yml up -d --build

# Check status
docker ps
docker logs -f ilp_backend_prod

# Test endpoint
curl http://localhost:8021/
```

## Automated Deployment (GitHub Actions)

### Setup GitHub Secrets

Go to your repository Settings → Secrets and variables → Actions, add:

```
SERVER_HOST=your.server.ip
SERVER_USERNAME=your-username
SERVER_PASSWORD=your-password
JWT_SECRET=your-jwt-secret
OPENROUTER_API_KEY=your-openrouter-key
```

### Trigger Deployment

Push to `main` branch:

```bash
git push origin main
```

GitHub Actions will automatically:
1. Create backups of current deployment
2. Copy new files to server
3. Build and restart containers
4. Verify health check
5. Clean old backups (keep last 5)

## Backup & Restore

### Manual Backup

```bash
cd /var/www/python.sicsglobal.com/ilp_backend
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup files
tar -czf backups/backup_$TIMESTAMP.tar.gz current/ uploads/ .env

# Backup database
docker exec ilp_mongo_prod mongodump --archive --gzip --db ilp_db > mongo_backups/mongo_backup_$TIMESTAMP.gz
```

### Restore from Backup

```bash
cd /var/www/python.sicsglobal.com/ilp_backend

# Stop containers
docker compose -p ilp_backend_prod -f docker-compose.prod.yml down

# Restore files
rm -rf current/*
tar -xzf backups/backup_20260307_120000.tar.gz -C .

# Restore database
docker compose -p ilp_backend_prod -f docker-compose.prod.yml up -d mongo
sleep 10
docker exec -i ilp_mongo_prod mongorestore --archive --gzip --drop < mongo_backups/mongo_backup_20260307_120000.gz

# Restart backend
cd current
docker compose -p ilp_backend_prod -f docker-compose.prod.yml up -d
```

## Monitoring

### Check Container Status

```bash
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### View Logs

```bash
# Backend logs
docker logs -f ilp_backend_prod

# MongoDB logs
docker logs -f ilp_mongo_prod

# Last 100 lines
docker logs --tail 100 ilp_backend_prod
```

### Health Check

```bash
curl http://localhost:8021/
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs ilp_backend_prod

# Check environment
docker exec ilp_backend_prod env

# Test database connection
docker exec ilp_backend_prod node -e "console.log('Test')"
```

### Database Connection Issues

```bash
# Check MongoDB status
docker exec ilp_mongo_prod mongosh --eval "db.stats()"

# Restart MongoDB
docker compose -p ilp_backend_prod -f docker-compose.prod.yml restart mongo
```

### Rollback Deployment

```bash
cd /var/www/python.sicsglobal.com/ilp_backend

# Find last known good backup
ls -lt backups/

# Restore using restore instructions above
```

## Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters
3. **Restrict CORS origins** - Only allow your frontend domain
4. **Regular backups** - Automated via GitHub Actions
5. **Keep containers updated** - Monitor for security patches

## Scaling

For higher traffic:

1. **Increase MongoDB resources**:
   ```yaml
   # In docker-compose.prod.yml
   deploy:
     resources:
       limits:
         memory: 2G
   ```

2. **Add reverse proxy** (Nginx):
   ```nginx
   location /api/ {
       proxy_pass http://localhost:8021;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

3. **Enable MongoDB replication** for high availability

## Support

For issues, check:
- Container logs: `docker logs ilp_backend_prod`
- Application logs in `uploads/` directory
- MongoDB logs: `docker logs ilp_mongo_prod`

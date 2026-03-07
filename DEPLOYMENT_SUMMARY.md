# Deployment Configuration Summary

## ✅ Complete Full-Stack Deployment Setup

### Configuration Changes

#### 1. Frontend Configuration
- **Vite Base Path**: `/intelligent-learning/`
- **React Router**: basename set to `/intelligent-learning`
- **API Client**: Uses relative URL `/intelligent-learning/api`
- **Build Output**: `frontend/dist/` → copied to `backend/static/`

#### 2. Backend Configuration
- **Port**: Changed to `8025`
- **Static Files**: Serves frontend from `/app/static` at root `/`
- **Routes**:
  - `/*` → React app (SPA routing)
  - `/api/*` → API endpoints
  - `/api/health` → Health check

**Note**: nginx handles the `/intelligent-learning` path prefix. Backend serves at root `/`.

#### 3. Docker Configuration
- **Project Name**: `ilp_prod`
- **Containers**: `ilp_prod` (backend), `ilp_mongo_prod` (MongoDB)
- **Port Mapping**: `8025:8025`
- **Volumes**:
  - `./uploads:/app/uploads` (user files)
  - `./static:/app/static:ro` (frontend build)

#### 4. GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: Push to `main` branch
- **Steps**:
  1. Build frontend (`npm run build`)
  2. Copy `frontend/dist/` + `backend/` to server
  3. Build Docker containers
  4. Health checks (API + Frontend)
  5. Backup old deployments (keeps last 5)

### Required GitHub Secrets

```bash
SERVER_HOST=your.server.ip.address
SERVER_USERNAME=your-server-username
SERVER_PASSWORD=your-server-password
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
OPENROUTER_API_KEY=your-openrouter-api-key
```

### nginx Configuration (Required)

Your nginx server should proxy `/intelligent-learning/*` to `http://localhost:8025/`:

```nginx
location /intelligent-learning/ {
    proxy_pass http://localhost:8025/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

See `DEPLOYMENT.md` for full nginx configuration.

### Deployment URLs

| Service | URL |
|---------|-----|
| Application | `https://python.sicsglobal.com/intelligent-learning` |
| API Health | `https://python.sicsglobal.com/intelligent-learning/api/health` |
| API Root | `https://python.sicsglobal.com/intelligent-learning/api` |

### Local Development

```bash
# Install all dependencies
npm run install:all

# Run in development mode
npm run dev

# Build for production
npm run build
# or
./build.sh
```

### Production Deployment

#### Automated (GitHub Actions)
```bash
git push origin main
```

#### Manual
```bash
# 1. Build locally
npm run build

# 2. Copy to server
scp -r backend/* user@server:/var/www/python.sicsglobal.com/ilp/current/
scp -r frontend/dist/* user@server:/var/www/python.sicsglobal.com/ilp/current/static/

# 3. Deploy on server
cd /var/www/python.sicsglobal.com/ilp/current
docker compose -p ilp_prod -f docker-compose.prod.yml up -d --build
```

### Files Created/Modified

#### Created
- `backend/Dockerfile.prod` - Production Dockerfile
- `backend/docker-compose.prod.yml` - Docker Compose config
- `backend/.env.production.example` - Environment template
- `backend/.dockerignore` - Docker ignore rules
- `frontend/.dockerignore` - Docker ignore rules
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `build.sh` - Build script
- `DEPLOYMENT.md` - Full deployment guide

#### Modified
- `frontend/vite.config.ts` - Added base path
- `frontend/src/main.tsx` - Added Router basename
- `frontend/src/services/api-client.ts` - Updated API base URL
- `backend/src/app.js` - Added static file serving
- `backend/package.json` - Added deployment scripts
- `package.json` - Added build scripts

### Testing Before Deploy

```bash
# Build locally
npm run build

# Test backend with static files
cd backend
STATIC_PATH=./static node src/index.js

# Open browser to:
# http://localhost:8025/  (frontend serves at root)
# http://localhost:8025/api/health  (API health check)
```

### Troubleshooting

**Frontend not loading?**
```bash
# Check if static files exist
ls -la backend/static/

# Check build has correct base path
grep -r "intelligent-learning" backend/static/
```

**API not responding?**
```bash
# Check container logs
docker logs ilp_prod

# Check health endpoint
curl http://localhost:8025/api/health
```

**Build fails?**
```bash
# Clear and rebuild
rm -rf frontend/node_modules frontend/dist backend/static
npm install
npm run build
```

---

## 🚀 Ready to Deploy!

Push to `main` branch and GitHub Actions will handle the rest.

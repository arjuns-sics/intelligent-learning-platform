# Deployment Checklist

## Pre-Deployment

- [ ] **Configure GitHub Secrets** (Repository Settings → Secrets and variables → Actions)
  - [ ] `SERVER_HOST` - Your server IP address
  - [ ] `SERVER_USERNAME` - SSH username
  - [ ] `SERVER_PASSWORD` - SSH password
  - [ ] `JWT_SECRET` - Minimum 32 characters (use: `openssl rand -base64 32`)
  - [ ] `OPENROUTER_API_KEY` - Your OpenRouter API key

- [ ] **Server Requirements**
  - [ ] Docker installed
  - [ ] Docker Compose installed
  - [ ] Port 8025 open in firewall
  - [ ] SSH access configured
  - [ ] Sufficient disk space (10GB+ recommended)

- [ ] **Domain Configuration** (if using custom domain)
  - [ ] DNS record: `python.sicsglobal.com` → your server IP
  - [ ] SSL certificate installed (Let's Encrypt recommended)
  - [ ] Reverse proxy configured (Nginx/Apache) - optional

## First Deployment

- [ ] **Initial Server Setup** (run once)
  ```bash
  ssh user@your-server-ip
  
  # Create directories
  sudo mkdir -p /var/www/python.sicsglobal.com/ilp
  sudo chown -R $USER:$USER /var/www/python.sicsglobal.com/ilp
  
  # Verify Docker
  docker --version
  docker-compose --version
  ```

- [ ] **Test Local Build**
  ```bash
  npm install
  npm run build
  ```

- [ ] **Verify Build**
  - [ ] `frontend/dist/` exists
  - [ ] `backend/static/` populated
  - [ ] Open `backend/static/index.html` - check for errors

- [ ] **Push to Deploy**
  ```bash
  git add .
  git commit -m "Initial deployment"
  git push origin main
  ```

- [ ] **Monitor GitHub Actions**
  - [ ] Go to: `https://github.com/your-org/your-repo/actions`
  - [ ] Click on running workflow
  - [ ] Watch for ✅ success or ❌ failure

## Post-Deployment

- [ ] **Verify Deployment**
  - [ ] Visit: `https://python.sicsglobal.com/intelligent-learning`
  - [ ] Check API: `https://python.sicsglobal.com/intelligent-learning/api/health`
  - [ ] Login works
  - [ ] Courses load
  - [ ] Quiz generation works

- [ ] **Monitor Logs** (if issues)
  ```bash
  ssh user@your-server-ip
  cd /var/www/python.sicsglobal.com/ilp/current
  docker logs -f ilp_prod
  ```

- [ ] **Check Container Status**
  ```bash
  docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  ```

## Ongoing Maintenance

- [ ] **Regular Updates**
  - [ ] Push to `main` triggers auto-deployment
  - [ ] Monitor deployment logs
  - [ ] Test after each deployment

- [ ] **Backup Verification**
  - [ ] Check backups exist: `/var/www/python.sicsglobal.com/ilp/backups/`
  - [ ] Check MongoDB backups: `/var/www/python.sicsglobal.com/ilp/mongo_backups/`
  - [ ] Verify backup rotation (keeps last 5)

- [ ] **Security**
  - [ ] Update dependencies monthly
  - [ ] Rotate JWT_SECRET quarterly
  - [ ] Monitor for security patches
  - [ ] Review CORS settings

- [ ] **Performance**
  - [ ] Monitor disk usage
  - [ ] Check MongoDB size
  - [ ] Review container resource usage
  - [ ] Clean old Docker images: `docker image prune -f`

## Troubleshooting

### Deployment Fails

1. **Check GitHub Actions logs**
   - Look for error messages
   - Verify all secrets are set correctly

2. **SSH to server and check**
   ```bash
   cd /var/www/python.sicsglobal.com/ilp/current
   docker logs ilp_prod
   docker compose -p ilp_prod -f docker-compose.prod.yml logs
   ```

3. **Manual rollback**
   ```bash
   cd /var/www/python.sicsglobal.com/ilp
   ls -t backups/
   # Restore from latest backup
   ```

### Frontend Not Loading

1. **Check static files**
   ```bash
   ls -la /var/www/python.sicsglobal.com/ilp/current/static/
   ```

2. **Verify base path in build**
   ```bash
   grep -r "intelligent-learning" /var/www/python.sicsglobal.com/ilp/current/static/
   ```

3. **Check nginx/reverse proxy** (if used)
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### API Not Responding

1. **Check container health**
   ```bash
   docker inspect --format='{{.State.Health.Status}}' ilp_prod
   ```

2. **Test database connection**
   ```bash
   docker exec ilp_mongo_prod mongosh --eval "db.stats()"
   ```

3. **Restart containers**
   ```bash
   docker compose -p ilp_prod -f docker-compose.prod.yml restart
   ```

## Success Criteria

✅ Application loads at `https://python.sicsglobal.com/intelligent-learning`
✅ Login/Signup works
✅ Courses display correctly
✅ Quiz generation with AI works
✅ Assignments can be submitted
✅ Progress tracking works
✅ No console errors in browser
✅ API health check returns 200
✅ All containers healthy

---

**Need Help?**

- Check `DEPLOYMENT.md` for detailed instructions
- Review `DEPLOYMENT_SUMMARY.md` for architecture
- Check container logs: `docker logs ilp_prod`
- Review GitHub Actions logs for deployment errors

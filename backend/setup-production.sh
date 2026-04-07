#!/bin/bash

# Intelligent Learning Platform - Backend Setup Script
# This script helps with initial server setup for deployment

set -e

echo "🚀 Intelligent Learning Platform - Backend Setup"
echo "================================================"

# Configuration
INSTALL_DIR="/var/www/python.sicsglobal.com/ilp_backend"
USER=$(whoami)

echo ""
echo "📁 Creating directory structure..."
sudo mkdir -p $INSTALL_DIR
sudo chown -R $USER:$USER $INSTALL_DIR
sudo chmod -R 755 $INSTALL_DIR

cd $INSTALL_DIR

# Create subdirectories
mkdir -p uploads backups mongo_backups current

echo "✅ Directory structure created at: $INSTALL_DIR"
echo ""
echo "📋 Directory structure:"
echo "   $INSTALL_DIR/"
echo "   ├── current/        (Application files)"
echo "   ├── uploads/        (User uploads)"
echo "   ├── backups/        (Application backups)"
echo "   └── mongo_backups/  (Database backups)"
echo ""

echo "🔐 Setting up environment file..."
if [ -f "current/.env" ]; then
    echo "⚠️  .env file already exists!"
    echo "   Location: $INSTALL_DIR/current/.env"
else
    echo "   Please create .env file in $INSTALL_DIR/current/"
    echo "   Use .env.production.example as template"
    echo ""
    echo "   Required variables:"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - NODE_ENV"
    echo "   - CORS_ORIGIN"
    echo "   - OPENROUTER_API_KEY"
fi

echo ""
echo "🐳 Docker Compose setup..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker and Docker Compose are installed"
    docker --version
    docker-compose --version
else
    echo "❌ Docker or Docker Compose not found!"
    echo "   Please install Docker and Docker Compose first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

echo ""
echo "📝 Next steps:"
echo "   1. Copy your backend files to: $INSTALL_DIR/current/"
echo "   2. Create .env file from .env.production.example"
echo "   3. Edit .env with your production values"
echo "   4. Run: cd $INSTALL_DIR/current && docker compose -p ilp_backend_prod -f docker-compose.prod.yml up -d --build"
echo "   5. Check status: docker ps"
echo "   6. Test: curl http://localhost:8021/api/health"
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT.md"
echo ""
echo "✅ Setup complete!"

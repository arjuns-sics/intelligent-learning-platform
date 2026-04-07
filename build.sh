#!/bin/bash

# Intelligent Learning Platform - Build Script
# Builds frontend and prepares for deployment

set -e

echo "🚀 Building Intelligent Learning Platform..."
echo "============================================"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Build frontend
echo ""
echo "📦 Building frontend..."
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Clean previous build
if [ -d "dist" ]; then
    echo "   Cleaning previous build..."
    rm -rf dist
fi

# Build
echo "   Building..."
npm run build

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist directory not found."
    exit 1
fi

echo "✅ Frontend build complete!"
echo "   Output: frontend/dist/"
echo "   Size: $(du -sh dist | cut -f1)"

# Copy to backend static directory
echo ""
echo "📦 Copying build to backend/static..."
cd "$SCRIPT_DIR"

# Create backend/static if it doesn't exist
mkdir -p backend/static

# Copy files
cp -r frontend/dist/* backend/static/

echo "✅ Build files copied to backend/static/"

# Summary
echo ""
echo "============================================"
echo "✅ Build complete!"
echo ""
echo "📁 Build artifacts:"
echo "   - frontend/dist/ (Vite build)"
echo "   - backend/static/ (Ready for deployment)"
echo ""
echo "🚀 Next steps:"
echo "   1. git add ."
echo "   2. git commit -m 'Build: new version'"
echo "   3. git push origin main"
echo ""
echo "   Or deploy manually:"
echo "   - Copy backend/ to server"
echo "   - Run: docker compose -p ilp_prod -f docker-compose.prod.yml up -d --build"
echo ""

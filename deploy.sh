#!/bin/bash

# Agent Charlie - Deployment Script
# This script helps deploy the Agent Charlie monorepo to Vercel

set -e

echo "🚀 Agent Charlie Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "frontend" ]] || [[ ! -d "backend" ]]; then
    echo -e "${RED}❌ Error: Please run this script from the monorepo root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment checklist...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check environment files
if [[ ! -f "frontend/.env" ]]; then
    echo -e "${YELLOW}⚠️  Creating frontend .env from example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${YELLOW}📝 Please update frontend/.env with your actual values${NC}"
fi

if [[ ! -f "backend/.env" ]]; then
    echo -e "${YELLOW}⚠️  Backend .env not found. Please create it before deploying backend.${NC}"
fi

echo -e "${BLUE}🧪 Running tests and type checking...${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm run install:all

# Run type checking
echo -e "${BLUE}🔍 Type checking...${NC}"
npm run typecheck

# Run linting
echo -e "${BLUE}🧹 Linting...${NC}"
npm run lint

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
npm run build:frontend

echo -e "${GREEN}✅ Pre-deployment checks passed!${NC}"
echo ""

# Deployment options
echo -e "${BLUE}🌐 Deployment Options:${NC}"
echo "1. Deploy to Vercel (Production)"
echo "2. Deploy to Vercel (Preview)"
echo "3. Deploy Backend Only (shows instructions)"
echo "4. Cancel"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Deploying to production...${NC}"
        vercel --prod
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo -e "${BLUE}📝 Don't forget to:${NC}"
        echo "   - Set environment variables in Vercel dashboard"
        echo "   - Deploy your backend to Railway/Render"
        echo "   - Update API URLs in environment variables"
        ;;
    2)
        echo -e "${BLUE}🔍 Deploying preview...${NC}"
        vercel
        echo -e "${GREEN}✅ Preview deployment complete!${NC}"
        ;;
    3)
        echo -e "${BLUE}🔧 Backend Deployment Instructions:${NC}"
        echo ""
        echo "Option A: Railway (Recommended)"
        echo "1. Install Railway CLI: npm install -g @railway/cli"
        echo "2. Login: railway login"
        echo "3. Create project: railway new"
        echo "4. Deploy: cd backend && railway up"
        echo ""
        echo "Option B: Render"
        echo "1. Go to render.com"
        echo "2. Connect GitHub repository"
        echo "3. Create new Web Service"
        echo "4. Set build command: cd backend && docker-compose up"
        echo ""
        echo "Option C: Self-hosted"
        echo "1. cd backend"
        echo "2. ./setup.sh"
        echo "3. docker-compose up -d"
        echo ""
        echo "📝 See DEPLOYMENT.md for detailed instructions"
        ;;
    4)
        echo -e "${YELLOW}❌ Deployment cancelled${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo ""
echo -e "${BLUE}📖 Next steps:${NC}"
echo "1. Configure environment variables in your deployment platform"
echo "2. Set up your backend (see DEPLOYMENT.md)"
echo "3. Test the integration"
echo "4. Set up monitoring and analytics"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "- README.md: General information"
echo "- DEPLOYMENT.md: Detailed deployment guide"
echo "- frontend/README.md: Frontend-specific docs"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
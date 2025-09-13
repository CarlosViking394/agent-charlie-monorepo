# Agent Charlie Documentation

This directory contains all documentation for the Agent Charlie project.

## 📚 Documentation Index

### 🚀 Getting Started
- **[DOCKER_STARTUP_GUIDE.md](DOCKER_STARTUP_GUIDE.md)** - Complete guide to starting services with Docker ✅
- **[DOCKER.md](DOCKER.md)** - Detailed Docker configuration and architecture
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment instructions

### 🏗️ Architecture & Development
- **[BACKEND_CLAUDE.md](BACKEND_CLAUDE.md)** - Multi-agent backend system architecture
- **[BACKEND_README.md](BACKEND_README.md)** - Backend API documentation and setup
- **[FRONTEND_README.md](FRONTEND_README.md)** - Frontend React application documentation
- **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - System integration overview

## 🎯 Quick Reference

### Current Status ✅
All Docker services are running successfully:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- n8n: http://localhost:5678
- Database: localhost:5432
- Redis: localhost:6379

### Essential Commands
```bash
# Docker development
npm run docker:dev        # Start all services
npm run docker:dev:status  # Check status
npm run docker:dev:logs    # View logs
npm run docker:dev:stop    # Stop services

# Development
npm run dev               # Run locally
npm run build            # Build for production
npm run test             # Run tests
```

## 📖 Reading Order

For new developers, recommended reading order:

1. **[DOCKER_STARTUP_GUIDE.md](DOCKER_STARTUP_GUIDE.md)** - Start here for environment setup
2. **[BACKEND_CLAUDE.md](BACKEND_CLAUDE.md)** - Understand the multi-agent architecture
3. **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - Overview of how components work together
4. **[BACKEND_README.md](BACKEND_README.md)** & **[FRONTEND_README.md](FRONTEND_README.md)** - Component-specific details
5. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment when ready

---

**Last Updated**: September 13, 2025
**Docker Status**: ✅ All services running successfully
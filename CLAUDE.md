# Agent Charlie - Claude Code Assistant Guide

## 🎯 Project Overview

Agent Charlie is a sophisticated multi-agent orchestration system designed to coordinate interactions between users and specialized service agents. This monorepo contains both frontend and backend components running in a containerized Docker environment.

## ✅ Current Status

**Docker Environment**: Successfully running in development mode
- ✅ Frontend (React/Vite): http://localhost:3000
- ✅ Backend (Express/TypeScript): http://localhost:3001
- ✅ n8n Workflows: http://localhost:5678
- ✅ PostgreSQL Database: localhost:5432
- ✅ Redis Cache: localhost:6379

## 📚 Documentation Structure

All project documentation has been organized in the `docs/` directory:

### 🐳 Docker & Deployment
- **[Docker Startup Guide](docs/DOCKER_STARTUP_GUIDE.md)** - Complete Docker setup and troubleshooting
- **[Docker Configuration](docs/DOCKER.md)** - Detailed Docker setup documentation
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions

### 🏗️ Architecture & Development
- **[Backend Architecture](docs/BACKEND_CLAUDE.md)** - Multi-agent backend system documentation
- **[Integration Summary](docs/INTEGRATION_SUMMARY.md)** - System integration overview
- **[Backend README](docs/BACKEND_README.md)** - Backend-specific setup and API docs
- **[Frontend README](docs/FRONTEND_README.md)** - Frontend-specific setup and components

## 🚀 Quick Start Commands

### Docker Development Environment
```bash
# Start all services (✅ Currently running)
npm run docker:dev

# Check service status
npm run docker:dev:status

# View logs
npm run docker:dev:logs

# Stop services
npm run docker:dev:stop

# Restart services
npm run docker:dev:restart
```

### Development Commands
```bash
# Install dependencies
npm run install:all

# Run locally (without Docker)
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

## 🧰 Development Workflow

1. **Services are already running** ✅
2. **Make code changes** in `frontend/` or `backend/` directories
3. **Hot reload** is enabled for both frontend and backend
4. **Test changes** at respective URLs above
5. **Monitor logs** with `npm run docker:dev:logs`

## 🔧 Maintenance Commands

### Docker Management
```bash
# Clean up volumes and restart fresh
npm run docker:dev:clean

# Production deployment
npm run docker:prod

# Backup production data
npm run docker:prod:backup
```

### Code Quality
```bash
# Run linting for both frontend and backend
npm run lint

# Fix linting issues
npm run lint:frontend -- --fix
npm run lint:backend -- --fix

# Type checking
npm run typecheck
```

## 🌐 Service URLs (Active)

| Service | URL | Status | Purpose |
|---------|-----|---------|----------|
| Frontend | http://localhost:3000 | ✅ Running | React UI application |
| Backend API | http://localhost:3001 | ✅ Running | Express API server |
| Health Check | http://localhost:3001/health | ✅ Active | Backend health monitoring |
| n8n Workflows | http://localhost:5678 | ✅ Running | Workflow automation |
| Adminer DB | http://localhost:8080 | ✅ Available | Database management |

## 🔑 Environment Configuration

Environment variables are configured in `.env` file:

```env
# Database
POSTGRES_USER=n8n
POSTGRES_PASSWORD=supersecret
POSTGRES_DB=n8n

# n8n Configuration
N8N_BASIC_AUTH_USER=charlie
N8N_BASIC_AUTH_PASSWORD=changeMe!

# External Services
ELEVENLABS_API_KEY=sk_***
SUPABASE_URL=https://xudjxewpiligutodpdsd.supabase.co
SUPABASE_SERVICE_ROLE=eyJ***
```

## 🏛️ Architecture Overview

```
Frontend (React)     Backend (Express)     n8n (Workflows)
     ↓                      ↓                    ↓
localhost:3000       localhost:3001      localhost:5678
     ↓                      ↓                    ↓
     └──────── Docker Network ──────────────────┘
                      ↓
            PostgreSQL + Redis
         localhost:5432   localhost:6379
```

## 📋 Common Tasks

### Adding New Features
1. **Frontend**: Edit files in `frontend/src/`
2. **Backend**: Edit files in `backend/src/`
3. **Workflows**: Configure at http://localhost:5678
4. **Database**: Use Adminer at http://localhost:8080

### Debugging Issues
1. **Check logs**: `npm run docker:dev:logs`
2. **Service status**: `npm run docker:dev:status`
3. **Health checks**: `curl localhost:3001/health`
4. **Container inspection**: `docker logs agent-charlie-dev-[service]-1`

### Testing APIs
```bash
# Backend health
curl http://localhost:3001/health

# API status
curl http://localhost:3001/api/status

# Test agent query
curl -X POST http://localhost:3001/api/agents/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test message", "context": {}}'
```

## 🚨 Troubleshooting

### Service Issues
- **Port conflicts**: Check with `lsof -i :3000` etc.
- **Container crashes**: Check logs with `docker logs [container-name]`
- **Database connection**: Verify PostgreSQL health status

### Code Issues
- **TypeScript errors**: Run `npm run typecheck`
- **Linting problems**: Run `npm run lint`
- **Build failures**: Check `npm run build`

## 🎯 Next Steps

With all services running successfully, you can:

1. **Develop features** - Frontend and backend are ready for development
2. **Configure workflows** - Set up n8n automations at localhost:5678
3. **Test integrations** - API endpoints are available for testing
4. **Deploy to production** - Use `npm run docker:prod` when ready

---

**Status**: ✅ All services running successfully in Docker development environment

For detailed information on any component, see the respective documentation files in the `docs/` directory.
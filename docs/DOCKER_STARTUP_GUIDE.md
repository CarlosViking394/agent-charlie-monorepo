# Docker Startup Guide for Agent Charlie

## ✅ Successfully Started Services

**Date**: September 13, 2025
**Status**: All services are running successfully in Docker development environment

## 🚀 Quick Start

The Agent Charlie development environment was successfully started using Docker Compose with the following command:

```bash
npm run docker:dev
```

## 📋 Service Status

All services are now running and accessible:

| Service | Status | URL | Description |
|---------|---------|-----|-------------|
| Frontend | ✅ Running | http://localhost:3000 | React/Vite development server |
| Backend API | ✅ Running | http://localhost:3001 | Express.js API server |
| n8n Workflow | ✅ Running | http://localhost:5678 | Workflow automation platform |
| PostgreSQL | ✅ Running | localhost:5432 | Database server |
| Redis | ✅ Running | localhost:6379 | Cache and session store |
| Adminer | ✅ Available | http://localhost:8080 | Database management (optional) |

## 🔧 Issues Resolved

During the startup process, several issues were identified and fixed:

### 1. Backend TypeScript Configuration
**Problem**: Backend was failing to start due to ES modules configuration conflicts
**Solution**:
- Removed `"type": "module"` from `backend/package.json`
- Updated `nodemon.json` to use `ts-node` properly
- Fixed unused variable warnings in TypeScript code

### 2. Frontend Browser Opening
**Problem**: Frontend container was crashing trying to open browser with `xdg-open`
**Solution**: Updated `vite.config.ts` to disable browser opening:
```typescript
server: {
  port: 3000,
  host: '0.0.0.0',
  open: false
}
```

### 3. Environment Configuration
**Problem**: Missing .env file caused warnings
**Solution**: System automatically created `.env` from template with development defaults

## 📊 Health Checks

### Backend Health Check
```bash
curl http://localhost:3001/health
# Response: {"status":"healthy","timestamp":"2025-09-13T04:20:38.750Z","service":"agent-charlie-backend"}
```

### Frontend Accessibility
```bash
curl http://localhost:3000
# Response: HTML page with React development server
```

### n8n Platform
- Accessible at http://localhost:5678
- Basic authentication: admin/admin123 (development)

## 🐳 Docker Container Status

```
NAME                           STATUS                 PORTS
agent-charlie-dev-backend-1    Up (healthy)          0.0.0.0:3001->3001/tcp
agent-charlie-dev-frontend-1   Up                    0.0.0.0:3000->3000/tcp
agent-charlie-dev-n8n-1        Up                    0.0.0.0:5678->5678/tcp
agent-charlie-dev-postgres-1   Up (healthy)          0.0.0.0:5432->5432/tcp
agent-charlie-dev-redis-1      Up (healthy)          0.0.0.0:6379->6379/tcp
```

## 🎯 Available Commands

### Development Commands
```bash
npm run docker:dev              # ✅ Start development environment
npm run docker:dev:stop         # Stop development environment
npm run docker:dev:restart      # Restart development environment
npm run docker:dev:logs         # View logs from all services
npm run docker:dev:status       # Show service status
npm run docker:dev:clean        # Clean up (removes volumes)
```

### Production Commands
```bash
npm run docker:prod             # Start production environment
npm run docker:prod:stop        # Stop production environment
npm run docker:prod:restart     # Restart production environment
npm run docker:prod:logs        # View production logs
npm run docker:prod:deploy      # Deploy updates (rebuild & restart)
npm run docker:prod:backup      # Create data backup
```

## 🔑 Environment Variables

The system uses environment variables from `.env` file:

```env
# Database
POSTGRES_USER=n8n
POSTGRES_PASSWORD=supersecret
POSTGRES_DB=n8n

# n8n Authentication
N8N_BASIC_AUTH_USER=charlie
N8N_BASIC_AUTH_PASSWORD=changeMe!

# External APIs
ELEVENLABS_API_KEY=sk_***
SUPABASE_URL=https://xudjxewpiligutodpdsd.supabase.co
SUPABASE_SERVICE_ROLE=eyJ***
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Frontend    │    │     Backend     │    │      n8n        │
│   (React/Vite)  │◄──►│   (Express)     │◄──►│   (Workflows)   │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5678    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐
         │   PostgreSQL    │    │     Redis       │
         │   Port: 5432    │    │   Port: 6379    │
         └─────────────────┘    └─────────────────┘
```

## 🚨 Troubleshooting

### If services fail to start:

1. **Check port conflicts**:
   ```bash
   lsof -i :3000
   lsof -i :3001
   lsof -i :5678
   ```

2. **View service logs**:
   ```bash
   npm run docker:dev:logs
   # Or specific service:
   docker logs agent-charlie-dev-backend-1
   ```

3. **Clean and restart**:
   ```bash
   npm run docker:dev:clean
   npm run docker:dev
   ```

## 🔄 Development Workflow

1. **Start services**: `npm run docker:dev` ✅
2. **Make changes**: Edit code in `frontend/` or `backend/`
3. **View changes**:
   - Frontend: Auto-reloads at http://localhost:3000
   - Backend: Auto-restarts with nodemon
4. **Check logs**: `npm run docker:dev:logs`
5. **Stop when done**: `npm run docker:dev:stop`

## ✨ Next Steps

With all services running successfully, you can now:

1. **Access the frontend**: Visit http://localhost:3000 to see the React application
2. **Test the API**: Make requests to http://localhost:3001/api endpoints
3. **Configure workflows**: Set up automation workflows at http://localhost:5678
4. **Database management**: Use Adminer at http://localhost:8080 if needed
5. **Monitor logs**: Use `npm run docker:dev:logs` to monitor all services

---

**✅ Status**: All services are running successfully and ready for development!
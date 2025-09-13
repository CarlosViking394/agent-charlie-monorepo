# Docker Setup for Agent Charlie

This guide will help you run the entire Agent Charlie monorepo using Docker, including the frontend, backend, database, Redis, and n8n workflow automation.

## Quick Start

### Development Environment

1. **Clone and setup**:
   ```bash
   git clone <your-repo-url>
   cd agent-charlie-monorepo
   ```

2. **Start development environment**:
   ```bash
   npm run docker:dev
   ```

3. **Access the services**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **n8n Workflows**: http://localhost:5678 (admin/admin123)
   - **Database**: localhost:5432
   - **Redis**: localhost:6379
   - **Adminer** (optional): http://localhost:8080

### Production Environment

1. **Configure environment**:
   ```bash
   # Create .env file with production values
   cp .env.example .env
   # Edit .env with your production configurations
   ```

2. **Start production environment**:
   ```bash
   npm run docker:prod
   ```

## Available Commands

### Development Commands
```bash
npm run docker:dev              # Start development environment
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

## Service Architecture

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

## Environment Configuration

### Development (.env for development)
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=dev_password
POSTGRES_DB=agent_charlie_dev

# n8n
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123
WEBHOOK_URL=http://localhost:5678/

# Add your API keys
ELEVENLABS_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key
```

### Production (.env for production)
```env
# Database (use strong passwords!)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password
POSTGRES_DB=agent_charlie

# n8n (use strong passwords!)
N8N_BASIC_AUTH_USER=your_admin_user
N8N_BASIC_AUTH_PASSWORD=your_strong_password
WEBHOOK_URL=https://your-domain.com:5678/

# Production API keys
ELEVENLABS_API_KEY=your_production_key
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE=your_production_service_role
```

## Service Details

### Frontend (React + Vite)
- **Development**: Hot reload enabled, source maps
- **Production**: Optimized build served by nginx
- **Health**: Automatic health checks
- **Environment**: Configured via VITE_ environment variables

### Backend (Express + TypeScript)
- **Development**: Nodemon for hot reload
- **Production**: Compiled TypeScript, optimized for performance
- **Health**: `/health` endpoint available
- **APIs**: RESTful endpoints at `/api/*`, webhooks at `/webhook/*`

### Database (PostgreSQL)
- **Version**: PostgreSQL 16
- **Data**: Persisted in Docker volumes
- **Access**: Available on standard port 5432
- **Health**: Built-in health checks

### Redis
- **Usage**: Caching, session storage, queue management
- **Configuration**: Optimized for development vs production
- **Persistence**: AOF enabled for data safety

### n8n (Workflow Automation)
- **Integration**: Connected to PostgreSQL for data persistence
- **Webhooks**: Available for external integrations
- **Environment**: All API keys exposed for HTTP Request nodes
- **Auth**: Basic authentication enabled

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :3001
   lsof -i :5678
   
   # Stop conflicting services or change ports in docker-compose files
   ```

2. **Permission errors**:
   ```bash
   # Make scripts executable
   chmod +x scripts/docker-dev.sh
   chmod +x scripts/docker-prod.sh
   ```

3. **Database connection issues**:
   ```bash
   # Check if PostgreSQL is healthy
   npm run docker:dev:status
   
   # View database logs
   docker-compose -f docker-compose.dev.yml logs postgres
   ```

4. **Build failures**:
   ```bash
   # Clean and rebuild
   npm run docker:dev:clean
   npm run docker:dev
   ```

### Viewing Logs

```bash
# All services
npm run docker:dev:logs

# Specific service
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Data Management

```bash
# Backup production data
npm run docker:prod:backup

# Reset development data
npm run docker:dev:clean
npm run docker:dev
```

## Development Workflow

1. **Start services**: `npm run docker:dev`
2. **Make changes**: Edit code in `frontend/` or `backend/`
3. **View changes**: Frontend auto-reloads, backend restarts automatically
4. **Check logs**: `npm run docker:dev:logs`
5. **Stop when done**: `npm run docker:dev:stop`

## Production Deployment

1. **Prepare environment**: Configure `.env` with production values
2. **Deploy**: `npm run docker:prod`
3. **Update**: `npm run docker:prod:deploy`
4. **Monitor**: `npm run docker:prod:logs`
5. **Backup**: `npm run docker:prod:backup`

## Security Considerations

- Change default passwords in production
- Use strong authentication for n8n
- Configure firewall rules appropriately
- Consider using HTTPS with reverse proxy
- Regularly backup your data
- Keep API keys secure and rotate them regularly

## Performance Optimization

- **Development**: Focus on development experience with hot reload
- **Production**: Optimized builds, proper caching, health checks
- **Database**: Connection pooling, proper indexing
- **Redis**: Memory optimization, appropriate persistence settings
- **Monitoring**: Health checks and logging configured

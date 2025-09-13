#!/bin/bash

# Production Docker Management Script for Agent Charlie

set -e

COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="agent-charlie"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}===================================${NC}"
    echo -e "${BLUE}  Agent Charlie - Docker Production${NC}"
    echo -e "${BLUE}===================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if .env file exists and has production values
check_env() {
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        print_info "Please create a .env file with production configuration"
        exit 1
    fi
    
    # Check for critical environment variables
    required_vars=("POSTGRES_PASSWORD" "N8N_BASIC_AUTH_PASSWORD")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env || grep -q "^${var}=$" .env; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            print_error "  - $var"
        done
        exit 1
    fi
}

# Start services
start() {
    print_header
    print_info "Starting Agent Charlie production environment..."
    
    check_env
    
    # Build and start
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d --build
    
    print_success "Production services started successfully!"
    print_info "Frontend: http://localhost"
    print_info "Backend API: http://localhost:3001"
    print_info "n8n: Check your WEBHOOK_URL configuration"
    print_info ""
    print_warning "Make sure your firewall and reverse proxy are properly configured"
    print_info "Use 'npm run docker:logs:prod' to view logs"
    print_info "Use 'npm run docker:stop:prod' to stop services"
}

# Stop services
stop() {
    print_info "Stopping Agent Charlie production environment..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    print_success "Production services stopped"
}

# Restart services
restart() {
    print_info "Restarting Agent Charlie production environment..."
    stop
    start
}

# Show logs
logs() {
    if [ -z "$2" ]; then
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f --tail=100
    else
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f --tail=100 "$2"
    fi
}

# Show status
status() {
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
}

# Update and restart (for production deployments)
deploy() {
    print_header
    print_info "Deploying Agent Charlie production update..."
    
    check_env
    
    # Pull latest images and rebuild
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME pull
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d --build --force-recreate
    
    # Clean up old images
    docker image prune -f
    
    print_success "Production deployment completed!"
}

# Backup data
backup() {
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="./backups/$timestamp"
    
    print_info "Creating backup in $backup_dir..."
    mkdir -p "$backup_dir"
    
    # Backup database
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T postgres pg_dump -U postgres agent_charlie > "$backup_dir/database.sql"
    
    # Backup n8n data
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T n8n tar czf - /home/node/.n8n > "$backup_dir/n8n_data.tar.gz"
    
    # Backup Redis data (if needed)
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T redis redis-cli BGSAVE
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T redis tar czf - /data > "$backup_dir/redis_data.tar.gz"
    
    print_success "Backup created in $backup_dir"
}

# Show health status
health() {
    print_info "Checking service health..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps --format table
}

# Main script logic
case "$1" in
    start|up)
        start
        ;;
    stop|down)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$@"
        ;;
    status|ps)
        status
        ;;
    deploy)
        deploy
        ;;
    backup)
        backup
        ;;
    health)
        health
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|deploy|backup|health}"
        echo ""
        echo "Commands:"
        echo "  start    - Start all production services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show logs (optional: specify service name)"
        echo "  status   - Show service status"
        echo "  deploy   - Update and restart for production deployment"
        echo "  backup   - Create backup of data volumes"
        echo "  health   - Check service health status"
        exit 1
        ;;
esac

#!/bin/bash

# Development Docker Management Script for Agent Charlie

set -e

COMPOSE_FILE="docker-compose.dev.yml"
PROJECT_NAME="agent-charlie-dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Agent Charlie - Docker Dev${NC}"
    echo -e "${BLUE}================================${NC}"
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

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found!"
        print_info "Creating .env from template..."
        
        cat > .env << 'EOF'
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=dev_password
POSTGRES_DB=agent_charlie_dev

# n8n Configuration
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=http
WEBHOOK_URL=http://localhost:5678/
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123

# ElevenLabs TTS Configuration (add your keys)
ELEVENLABS_API_KEY=
ELEVENLABS_DEFAULT_VOICE_ID=
ELEVENLABS_MODEL_ID=eleven_monolingual_v1

# Supabase Configuration (add your keys)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE=
SUPABASE_BUCKET=
SUPABASE_PUBLIC_URL_PREFIX=

# Development Environment
NODE_ENV=development
EOF
        
        print_success "Created .env file with development defaults"
        print_warning "Please update the .env file with your API keys before running"
    fi
}

# Start services
start() {
    print_header
    print_info "Starting Agent Charlie development environment..."
    
    check_env
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    
    print_success "Services started successfully!"
    print_info "Frontend: http://localhost:3000"
    print_info "Backend API: http://localhost:3001"
    print_info "n8n: http://localhost:5678"
    print_info "Database: localhost:5432"
    print_info "Redis: localhost:6379"
    print_info "Adminer (optional): http://localhost:8080"
    print_info ""
    print_info "Use 'npm run docker:logs' to view logs"
    print_info "Use 'npm run docker:stop' to stop services"
}

# Stop services
stop() {
    print_info "Stopping Agent Charlie development environment..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    print_success "Services stopped"
}

# Restart services
restart() {
    print_info "Restarting Agent Charlie development environment..."
    stop
    start
}

# Show logs
logs() {
    if [ -z "$2" ]; then
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f
    else
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f "$2"
    fi
}

# Show status
status() {
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
}

# Clean up
clean() {
    print_warning "This will remove all containers, networks, and volumes for the development environment"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up development environment..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed"
    else
        print_info "Cleanup cancelled"
    fi
}

# Build images
build() {
    print_info "Building images for development environment..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build --no-cache
    print_success "Images built successfully"
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
    clean)
        clean
        ;;
    build)
        build
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|clean|build}"
        echo ""
        echo "Commands:"
        echo "  start    - Start all development services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show logs (optional: specify service name)"
        echo "  status   - Show service status"
        echo "  clean    - Remove all containers, networks, and volumes"
        echo "  build    - Rebuild all images"
        exit 1
        ;;
esac

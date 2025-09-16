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

## 🎨 UI Design Concept - Agent Charlie Platform

### Design Philosophy
Agent Charlie should embody the perfect balance between cutting-edge AI technology and human-centered design. The interface serves as a sophisticated yet approachable portal where users discover and interact with specialized AI agents.

### Core Visual Identity

#### Liquid Glass Aesthetic
- **Primary Material**: Translucent surfaces with 95% opacity, subtle blur effects (backdrop-filter: blur(20px))
- **Reflective Elements**: Gentle surface reflections with 10% opacity overlays
- **Depth Layering**: Multiple glass planes with varying transparency levels (85%, 92%, 98%)
- **Dynamic Glows**: Soft ambient lighting effects with 2-4px glow radius
- **Interactive Ripples**: Subtle animation responses to user interactions

#### Color Palette
```scss
$primary-glass: rgba(255, 255, 255, 0.08);
$glass-border: rgba(255, 255, 255, 0.12);
$accent-glow: rgba(99, 102, 241, 0.3);
$text-primary: rgba(255, 255, 255, 0.95);
$text-secondary: rgba(255, 255, 255, 0.7);
$background-dark: #0a0a0b;
$background-gradient: linear-gradient(135deg, #0f0f10 0%, #1a1a1c 100%);
```

### Layout Structure

#### 1. Hero Header Section
**Elevated Glass Navigation Bar**
- Semi-transparent navigation with floating appearance
- Subtle shadow depth: `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)`
- Logo with ambient glow effect and subtle pulse animation
- User profile avatar with liquid border animation

**Main Hero Content**
- **Headline**: "Discover Your Perfect AI Companion" 
  - Typography: Bold, 48px, gradient text effect
  - Subtle text shadow with glow
- **Subheading**: "Connect with specialized AI agents tailored to your unique needs"
  - Typography: Regular, 18px, semi-transparent
- **Background**: Animated particle system with floating geometric elements
- **Glass Panel**: Central content area with multi-layered transparency

#### 2. Enhanced Agent Search Section
**Smart Search Interface**
- **Search Bar**: 
  - Frosted glass container with inner glow
  - Floating label animation
  - Real-time suggestions with glass dropdown
  - Voice input button with wave visualization
  - AI-powered autocomplete with agent preview cards

**Advanced Filtering System**
- **Filter Chips**: Pill-shaped glass elements with soft shadows
- **Category Selector**: Radial menu with liquid transitions
- **Skill Tags**: Dynamic tag cloud with interactive hover states
- **Sorting Options**: Elegant dropdown with animation transitions

**Search Enhancement Features**
- **AI Intent Recognition**: "I need help with..." natural language input
- **Quick Actions**: Pre-defined search templates
- **Recent Searches**: Glass carousel of previous queries
- **Trending Agents**: Featured recommendations with subtle animations

#### 3. Agent Discovery Grid
**Card Design System**
- **Agent Cards**: 
  - Rounded glass containers (border-radius: 16px)
  - Hover elevation with increased blur and glow
  - Agent avatar with liquid border animation
  - Skill badges with glass effect
  - Rating system with star glow animation
  - Quick action buttons with ripple effects

**Interactive Elements**
- **Preview Modal**: Full-screen glass overlay with agent details
- **Comparison Tool**: Side-by-side agent comparison interface
- **Save to Favorites**: Animated heart icon with glow effect
- **Share Agent**: Social sharing with glass bottom sheet

#### 4. Advanced UI Components

**Intelligent Recommendation Engine**
- **Personalized Dashboard**: Custom agent recommendations
- **Usage Analytics**: Beautiful glass charts and metrics
- **Learning Path**: Progressive disclosure of agent capabilities
- **Success Stories**: Testimonial cards with liquid animations

**Interactive Features**
- **Agent Chat Preview**: Floating chat interface with glass backdrop
- **Capability Demonstration**: Interactive demos within glass containers
- **Booking System**: Elegant calendar with glass date picker
- **Payment Flow**: Secure checkout with premium glass design

### Micro-Interactions & Animations

#### Liquid Animations
- **Page Transitions**: Fluid morphing between glass panels
- **Scroll Effects**: Parallax movement with depth layers
- **Hover States**: Gentle scale and glow transformations
- **Loading States**: Liquid progress indicators with wave motion
- **Success Feedback**: Celebratory particle effects

#### Responsive Behaviors
- **Mobile Adaptation**: Collapsing glass panels for smaller screens
- **Touch Gestures**: Swipe animations with elastic feedback
- **Accessibility**: High contrast mode preserving glass aesthetic
- **Dark/Light Themes**: Adaptive transparency levels

### User Experience Enhancements

#### Onboarding Flow
- **Welcome Wizard**: Step-by-step glass panels with progress indicators
- **Capability Discovery**: Interactive tutorials for platform features
- **Preference Setting**: Elegant form design with glass inputs
- **First Agent Match**: Guided recommendation process

#### Personalization
- **Custom Themes**: User-defined color accents within glass framework
- **Layout Preferences**: Customizable dashboard configurations
- **Notification Center**: Glass overlay with priority messaging
- **Activity Timeline**: Personal usage history with visual timeline

### Technical Implementation Notes

#### Performance Optimization
- **Lazy Loading**: Progressive image loading for agent avatars
- **Component Virtualization**: Efficient rendering for large agent lists
- **Animation Optimization**: CSS transforms over layout properties
- **Bundle Splitting**: Separate chunks for different feature areas

#### Accessibility Standards
- **WCAG Compliance**: Full accessibility support with glass effects
- **Keyboard Navigation**: Clear focus indicators within glass elements
- **Screen Reader**: Semantic markup with proper ARIA labels
- **Motion Preferences**: Respect user's motion sensitivity settings

### Figma Design System Integration

#### Component Library
- **Glass Base Components**: Reusable glass panel variations
- **Typography Scale**: Defined text styles with glow effects
- **Icon System**: Custom icons with liquid animations
- **Color Tokens**: Semantic color system for glass elements
- **Spacing System**: Consistent layout grid with glass gutters

#### Design Tokens
```json
{
  "glass": {
    "primary": "rgba(255, 255, 255, 0.08)",
    "secondary": "rgba(255, 255, 255, 0.05)",
    "border": "rgba(255, 255, 255, 0.12)"
  },
  "effects": {
    "glow": "0 0 20px rgba(99, 102, 241, 0.3)",
    "shadow": "0 8px 32px rgba(0, 0, 0, 0.3)",
    "blur": "blur(20px)"
  },
  "animation": {
    "fast": "200ms ease-out",
    "normal": "300ms ease-in-out",
    "slow": "500ms ease-in-out"
  }
}
```

This design concept creates a premium, futuristic experience that positions Agent Charlie as the definitive platform for AI agent discovery, combining sophisticated liquid glass aesthetics with intuitive user experience patterns.

---

**Status**: ✅ All services running successfully in Docker development environment

For detailed information on any component, see the respective documentation files in the `docs/` directory.
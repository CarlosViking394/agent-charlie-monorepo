# Agent Charlie Backend v2.0 Setup Guide

## 🏗️ Architecture Overview

The new backend implements the multi-agent architecture from BACKEND_CLAUDE.md:

- **Charlie (Root Agent)**: Orchestrator and intent classifier
- **Specialized Agents**: Restaurant, Bank, Travel, Healthcare, Entertainment
- **Authentication**: Multi-provider OAuth + Email/Password
- **Database**: Supabase PostgreSQL with comprehensive schema
- **Security**: JWT tokens, rate limiting, CORS protection

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your actual values
nano .env
```

### 3. Required Environment Variables

**Critical (must set):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your_openai_api_key
```

**OAuth Providers (optional but recommended):**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id  
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4. Database Setup
```bash
# Run database schema setup
npm run setup:db

# Or manually run the SQL schema from:
# src/services/database/schemas.sql
```

### 5. Start Development Server
```bash
npm run dev
```

## 🔐 Authentication Features

### Supported Login Methods
- ✅ **Google OAuth** - "Sign in with Google"
- ✅ **GitHub OAuth** - "Sign in with GitHub" 
- ✅ **Microsoft OAuth** - "Sign in with Microsoft"
- ✅ **Apple OAuth** - "Sign in with Apple"
- ✅ **Email/Password** - Traditional signup/login

### Authentication Endpoints
```bash
# Get available auth providers
GET /auth/providers

# Email/password signup
POST /auth/signup
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

# Email/password signin  
POST /auth/signin
{
  "email": "user@example.com", 
  "password": "securepassword"
}

# OAuth URLs (redirect user to these)
GET /auth/google
GET /auth/github
GET /auth/microsoft
GET /auth/apple

# Sign out
POST /auth/signout

# Get current user
GET /auth/me

# Refresh token
POST /auth/refresh
```

## 🤖 Agent System Features

### Available Agents
1. **Charlie (Root)** - Orchestrator, intent classification
2. **Restaurant Agent** - Dining, reservations, food orders
3. **Bank Agent** - Finance, payments, account management
4. **Travel Agent** - Flights, hotels, trip planning
5. **Healthcare Agent** - Medical appointments, health services
6. **Entertainment Agent** - Events, tickets, shows

### Agent Endpoints
```bash
# Chat with Charlie (main endpoint)
POST /api/agents/chat
{
  "message": "I need a plumber in Brooklyn",
  "conversationId": "optional-conversation-id",
  "context": {
    "history": []
  }
}

# Get available agents
GET /api/agents

# Get specific agent info
GET /api/agents/charlie-root-001

# Agent health check
GET /api/agents/charlie-root-001/health
```

## 🗄️ Database Schema

The system uses these main tables:
- **users** - User accounts and preferences
- **sessions** - Login sessions and device tracking
- **conversations** - Chat conversations
- **messages** - Individual messages with intent classification
- **agents** - Agent definitions and configurations
- **agent_interactions** - Logs of agent communications
- **workflow_executions** - n8n workflow execution tracking

## 🔧 Configuration Options

### Agent Configuration
```env
MAX_CONVERSATION_LENGTH=50
AGENT_TIMEOUT_MS=30000
MAX_CONCURRENT_AGENTS=10
INTENT_CLASSIFICATION_THRESHOLD=0.8
```

### Security Configuration
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=your-session-secret
```

### LLM Configuration
```env
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

## 🧪 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. API Status
```bash
curl http://localhost:3001/api/status
```

### 3. Chat with Charlie
```bash
curl -X POST http://localhost:3001/api/agents/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Charlie, I need help finding a restaurant"}'
```

### 4. Authentication Test
```bash
# Get auth providers
curl http://localhost:3001/auth/providers

# Test signup
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'
```

## 🔄 Integration with Frontend

### Update Frontend Environment Variables
```env
VITE_API_URL=http://localhost:3001
VITE_BACKEND_URL=http://localhost:3001
VITE_AUTH_URL=http://localhost:3001/auth
```

### Frontend Authentication Flow
```typescript
// Check auth status
const response = await fetch('/api/auth/me', {
  credentials: 'include'
});

// Sign in with OAuth
window.location.href = '/auth/google';

// Sign out
await fetch('/api/auth/signout', {
  method: 'POST',
  credentials: 'include'
});
```

## 🚨 Troubleshooting

### Common Issues

**Database connection fails:**
- Check Supabase URL and service role key
- Ensure Supabase project is active
- Run database schema setup

**Authentication errors:**
- Verify OAuth client IDs and secrets
- Check redirect URLs in OAuth provider settings
- Ensure JWT_SECRET is set

**Agent responses fail:**
- Check OpenAI API key and quota
- Verify network connectivity
- Check rate limiting settings

**CORS errors:**
- Add your frontend URL to CORS origins
- Check credentials: true in frontend requests

## 📊 Performance Monitoring

The backend includes built-in monitoring:
- Agent response times
- Authentication success rates
- Database query performance
- Error tracking and logging

## 🔮 Next Steps

1. **Configure OAuth Providers** - Set up Google, GitHub, etc.
2. **Customize Agents** - Add domain-specific logic
3. **Connect n8n Workflows** - Integrate existing TTS workflow
4. **Add Specialized Agents** - Implement restaurant, travel, etc. agents
5. **Deploy to Production** - Use Docker compose for production deployment

## 📞 Support

- Check logs: `npm run dev` (console output)
- Database issues: Check Supabase dashboard
- Authentication: Test endpoints individually
- Agent behavior: Enable debug mode in .env

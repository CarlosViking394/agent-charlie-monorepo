# Deployment Guide - Agent Charlie

This guide covers deploying Agent Charlie to Vercel with proper backend integration.

## 🏗️ Architecture Overview

- **Frontend**: React SPA deployed to Vercel
- **Backend**: n8n workflows (can be deployed to Railway, Render, or self-hosted)
- **Database**: Supabase (managed PostgreSQL)
- **AI Services**: ElevenLabs TTS, OpenAI (via n8n workflows)

## 🚀 Quick Deployment

### 1. Vercel Frontend Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from monorepo root
cd agent-charlie-monorepo
vercel --prod

# Or use the button below:
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CarlosViking394/agent-Charlie)

### 2. Backend Deployment Options

#### Option A: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Connect GitHub repository 
3. Deploy the `backend/` directory
4. Set environment variables (see below)

#### Option B: Render
1. Go to [Render.com](https://render.com)
2. Create new Web Service from GitHub
3. Set build command: `cd backend && docker-compose up`
4. Set environment variables

#### Option C: Self-hosted
```bash
cd backend/
./setup.sh
docker-compose up -d
```

## ⚙️ Environment Configuration

### Frontend Environment Variables (Vercel)

Set these in Vercel Dashboard → Settings → Environment Variables:

```env
# API Configuration
VITE_API_URL=https://your-n8n-instance.railway.app
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.railway.app/webhook

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_TTS=true
VITE_ENABLE_CHAT=true
VITE_APP_ENV=production
```

### Backend Environment Variables

Set these in your backend deployment platform:

```env
# ElevenLabs TTS
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_MODEL_ID=eleven_multilingual_v3

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# n8n Configuration
N8N_ENCRYPTION_KEY=your-32-char-encryption-key
WEBHOOK_URL=https://your-n8n-instance.railway.app

# Database (if not using n8n's built-in)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=n8n

# Optional: OpenAI
OPENAI_API_KEY=your-openai-key
```

## 📋 Step-by-Step Deployment

### Step 1: Prepare Repository
```bash
# Clone the monorepo
git clone <your-repo-url>
cd agent-charlie-monorepo

# Install dependencies
npm run install:all

# Test locally
npm run dev
```

### Step 2: Deploy Backend First

1. **Create Railway Project**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and create project
   railway login
   railway new
   ```

2. **Configure n8n Service**:
   - Set environment variables in Railway dashboard
   - Deploy from `backend/` directory
   - Note the deployment URL

3. **Import n8n Workflows**:
   - Access n8n at `https://your-n8n.railway.app`
   - Import workflows from `backend/workflows/`
   - Configure and activate workflows

### Step 3: Deploy Frontend

1. **Configure Vercel**:
   ```bash
   # From monorepo root
   vercel
   
   # Follow prompts:
   # - Set up and deploy: Yes
   # - Which scope: Your account
   # - Link to existing project: No
   # - Project name: agent-charlie
   # - Directory: ./
   ```

2. **Set Environment Variables**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all frontend environment variables listed above
   - Replace `your-n8n-instance.railway.app` with actual Railway URL

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Step 4: Configure Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Go to Project → Settings → Domains
   - Add your domain (e.g., `agentcharlie.com`)

2. **Update Environment Variables**:
   - Update `VITE_API_URL` to use your custom backend domain
   - Update CORS settings in backend if needed

## 🔧 Post-Deployment Setup

### 1. Test API Connection
```bash
# Test frontend-backend connection
curl https://your-frontend.vercel.app/api/health

# Test n8n webhooks
curl -X POST https://your-n8n.railway.app/webhook/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

### 2. Import Sample Data
```bash
# Run data seeding scripts if available
cd backend/
npm run seed
```

### 3. Configure Monitoring
- Set up error tracking (Sentry, LogRocket)
- Configure uptime monitoring
- Set up analytics (Google Analytics, PostHog)

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure backend allows requests from frontend domain
   - Check n8n CORS settings

2. **Environment Variables Not Loading**:
   - Verify variables are set in deployment platform
   - Check variable names match exactly
   - Ensure `VITE_` prefix for frontend variables

3. **Build Failures**:
   ```bash
   # Check TypeScript errors
   npm run typecheck
   
   # Check linting
   npm run lint
   ```

4. **n8n Workflows Not Responding**:
   - Verify workflows are active in n8n interface
   - Check webhook URLs are correct
   - Verify environment variables in n8n

### Debug Commands

```bash
# Check deployment logs
vercel logs

# Test backend health
curl https://your-backend-url/health

# Check environment
vercel env ls
```

## 📊 Performance Optimization

### Frontend
- Enable Vercel Edge caching
- Optimize images and assets
- Use code splitting
- Enable service workers

### Backend
- Scale n8n instances based on usage
- Implement Redis caching
- Optimize database queries
- Set up CDN for static assets

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] API keys rotated regularly  
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting enabled
- [ ] Error messages don't expose sensitive info

## 📈 Monitoring & Analytics

- Set up application monitoring
- Configure error tracking
- Monitor API usage and performance
- Track user interactions and conversion
- Set up alerts for system health

---

**Need Help?** Check the [README.md](./README.md) or create an issue in the repository.
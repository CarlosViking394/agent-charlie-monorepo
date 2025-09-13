# Vercel Deployment Guide - Agent Charlie

## Prerequisites
1. ✅ Cloudflare tunnel working (n8n.agentcharlie.live accessible)
2. ✅ n8n running locally on port 5678
3. ✅ Vercel CLI installed: `npm i -g vercel`

## Step 1: Deploy to Vercel

### Quick Deploy
```bash
# From project root
cd /Users/LocalAdmin/Desktop/Local/Personal/agent-charlie-monorepo
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your personal account
- **Link to existing project?** No (create new)
- **Project name:** `agent-charlie` (or your preference)
- **In which directory is your code located?** `./`

## Step 2: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

### Frontend Environment Variables
```env
# API Configuration
VITE_API_URL=https://n8n.agentcharlie.live
VITE_N8N_WEBHOOK_URL=https://n8n.agentcharlie.live/webhook
VITE_N8N_URL=https://n8n.agentcharlie.live

# Supabase (if using)
VITE_SUPABASE_URL=https://xudjxewpiligutodpdsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZGp4ZXdwaWxpZ3V0b2RwZHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MjMzNzMsImV4cCI6MjA3MjA5OTM3M30.mITlXK1yiEnkJqCI8MchSSPFl4EV3qsAhmY8DmejS0Y

# Feature Flags
VITE_ENABLE_TTS=true
VITE_ENABLE_CHAT=true
VITE_APP_ENV=production
NODE_ENV=production
```

## Step 3: Custom Domain (Optional)

### Add Your Domain to Vercel
1. Go to Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `agentcharlie.live` or `app.agentcharlie.live`)
4. Follow Vercel's DNS instructions

### Update Cloudflare DNS for Frontend
Add these records in Cloudflare DNS:

**For root domain (`agentcharlie.live`):**
```
Type: CNAME
Name: @
Content: cname.vercel-dns.com
Proxy: OFF (gray cloud)
```

**For subdomain (`app.agentcharlie.live`):**
```
Type: CNAME  
Name: app
Content: cname.vercel-dns.com
Proxy: OFF (gray cloud)
```

## Step 4: Verify Deployment

### Test URLs
After deployment, test these endpoints:

```bash
# Frontend (replace with your Vercel URL)
curl -I https://agent-charlie.vercel.app/

# n8n Backend 
curl -I https://n8n.agentcharlie.live/

# TTS Webhook
curl -X POST https://n8n.agentcharlie.live/webhook/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world test"}'
```

## Step 5: Environment-Specific Configuration

### Development vs Production

**Local Development:**
- Frontend: `localhost:3000`
- Backend: `localhost:5678` 
- Database: Local Docker

**Production:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://n8n.agentcharlie.live`
- Database: Supabase or hosted PostgreSQL

## Troubleshooting

### Common Issues

**1. Build Failures:**
```bash
# Check TypeScript errors locally
npm run typecheck

# Check build locally
cd frontend && npm run build
```

**2. CORS Errors:**
- Ensure n8n allows requests from your Vercel domain
- Check CORS settings in n8n workflows

**3. Environment Variables Not Loading:**
- Verify `VITE_` prefix for frontend variables
- Check variables are set in Vercel dashboard
- Redeploy after adding variables

**4. API Routes Not Working:**
- Verify `vercel.json` rewrites point to correct n8n URL
- Test n8n endpoints directly first

### Debug Commands
```bash
# View deployment logs
vercel logs

# Check environment variables
vercel env ls

# Test local build
vercel dev
```

## Final Checklist

- [ ] Cloudflare tunnel running and accessible
- [ ] n8n responding on https://n8n.agentcharlie.live
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured in Vercel
- [ ] Custom domain added (if desired)
- [ ] TTS webhook working
- [ ] Frontend can communicate with n8n backend

## Support

If you encounter issues:
1. Check the CLOUDFLARE_SETUP.md guide first
2. Verify all environment variables are correct
3. Test each component individually
4. Check Vercel deployment logs

# Cloudflare Tunnel Setup Guide

## Current Issue: HTTP 530 Error

Your tunnel `61e42cbe-012a-45c9-841b-a95d6a9c0478` exists but can't connect properly.

## Fix Steps:

### 1. Check Cloudflare DNS Records

Go to Cloudflare Dashboard → agentcharlie.live → DNS → Records

**Required CNAME Record:**
```
Type: CNAME
Name: n8n
Content: 61e42cbe-012a-45c9-841b-a95d6a9c0478.cfargotunnel.com
Proxy Status: ✅ Proxied (orange cloud)
TTL: Auto
```

**If this record is missing or incorrect:**
1. Delete any existing `n8n` records
2. Click "Add Record"
3. Set Type: `CNAME`
4. Set Name: `n8n`
5. Set Content: `61e42cbe-012a-45c9-841b-a95d6a9c0478.cfargotunnel.com`
6. Ensure proxy is ON (orange cloud)
7. Click Save

### 2. Fix Tunnel Configuration

The tunnel should route to your local n8n instance. Current config looks correct:

```yaml
# backend/cloudflare/config.yml
tunnel: 61e42cbe-012a-45c9-841b-a95d6a9c0478
credentials-file: /Users/LocalAdmin/.cloudflared/61e42cbe-012a-45c9-841b-a95d6a9c0478.json

ingress:
  - hostname: n8n.agentcharlie.live
    service: http://localhost:5678  # ← This should point to your n8n
  - service: http_status:404
```

### 3. Start Tunnel Properly

From the backend directory:

```bash
cd backend/
cloudflared tunnel run --config cloudflare/config.yml n8n-tunnel
```

**Keep this terminal open!** The tunnel needs to stay running.

### 4. Verify n8n is Running

Ensure n8n is accessible locally:
```bash
curl http://localhost:5678/
# Should return HTML or redirect, not connection refused
```

### 5. Test Domain

After DNS propagates (2-3 minutes):
```bash
curl -I https://n8n.agentcharlie.live/
# Should return HTTP 200 or 301/302, not 530
```

## Troubleshooting

**If still getting 530:**
1. Check n8n is running: `docker ps | grep n8n`
2. Verify tunnel is connected: `cloudflared tunnel info 61e42cbe-012a-45c9-841b-a95d6a9c0478`
3. Test localhost: `curl localhost:5678`
4. Check Cloudflare logs in dashboard

**Alternative: Create New Tunnel**
If issues persist, create a fresh tunnel:
```bash
cloudflared tunnel create agentcharlie-n8n
cloudflared tunnel route dns agentcharlie-n8n n8n.agentcharlie.live
# Update config.yml with new tunnel ID
```

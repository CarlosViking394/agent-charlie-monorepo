# agentcharlie-n8n

This repo runs [n8n](https://n8n.io) locally with Postgres and exposes a Text-to-Speech webhook powered by ElevenLabs.

## Prerequisites
- Docker & Docker Compose
- Optional: Cloudflare Tunnel, Supabase CLI for edge functions

## Quick Setup

### Automatic Setup (Recommended)
```bash
./setup.sh
```

### Manual Setup
1. `cp .env.example .env` and fill in values (especially `ELEVENLABS_API_KEY`)
2. `cp n8n/.n8n_encryption_key.example n8n/.n8n_encryption_key` then replace with a real key:
   ```bash
   openssl rand -base64 32 > n8n/.n8n_encryption_key
   ```
3. `docker compose up -d`
4. Visit [http://localhost:5678](http://localhost:5678) to finish n8n setup.

### Validate Setup
```bash
./validate-setup.sh
```

## Cloudflare Tunnel (optional)
1. Create a tunnel in your account mapping `n8n.agentcharlie.live` → `http://localhost:5678`.
2. Update DNS CNAME as instructed by Cloudflare.
3. Set `WEBHOOK_URL=https://n8n.agentcharlie.live/` in `.env`, then `docker compose restart n8n`.

## Workflow
1. Import `workflows/elevenlabs-tts-webhook.json` into n8n (`Workflows → Import from File`).
2. Test webhook:
   - Local test URL: `http://localhost:5678/webhook-test/tts`
   - Public prod URL: `https://n8n.agentcharlie.live/webhook/tts`
   - Body:
     ```json
     { "text": "Hola mundo", "voice_id": "YOUR_VOICE_ID_OPTIONAL" }
     ```

## React Native
Copy `frontend-snippets/useTTS.ts` into your app and call `speakViaN8N("Hola mundo")`.
For a role-based AI agent interface with chat, payments, user data and analytics, see `frontend-snippets/AgentInterface.tsx`.

## Optional Supabase Flow
Deploy the edge function in `supabase/edge-functions/upload-tts-audio`, set envs, and in n8n add a node to POST base64 audio to the function, then return the public URL.

## Features

### ✅ ElevenLabs Integration
- **Voice Cloning Support**: Use your custom cloned voices
- **Multiple Models**: Supports v2 (stable) and v3 (most expressive) models
- **Voice Settings**: Configurable stability and similarity boost
- **Error Handling**: Proper authentication and error responses

### ✅ Production Ready
- **Docker Environment**: Isolated, reproducible setup
- **Environment Security**: Sensitive data in .env files (gitignored)
- **Health Checks**: Database health monitoring
- **Validation Scripts**: Automated environment validation

### ✅ Developer Experience
- **Hot Reloading**: n8n workflow updates without restart
- **Test Endpoints**: Separate test webhook for development
- **Frontend Integration**: React Native TTS hook included
- **Comprehensive Logging**: Docker logs for debugging

## Troubleshooting

### Common Issues
1. **404 Webhook Not Found**: Make sure workflow is saved and active
2. **Invalid API Key**: Verify your ElevenLabs API key in .env
3. **Voice Not Found**: Use available voice IDs from your ElevenLabs account
4. **Database Connection**: Run `docker compose logs postgres` for DB issues

### Getting Help
- Check `docker compose logs` for service logs
- Run `./validate-setup.sh` to verify configuration
- Ensure all required .env variables are set
# Force deployment Sat Sep  6 17:46:19 AEST 2025

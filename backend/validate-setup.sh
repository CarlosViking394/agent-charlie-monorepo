#!/bin/bash

# AgentCharlie Environment Validation Script
# Checks if everything is properly configured

echo "🔍 Validating AgentCharlie TTS setup..."

# Check if .env exists and has required variables
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

echo "✅ .env file found"

# Check for required environment variables
required_vars=("ELEVENLABS_API_KEY" "POSTGRES_USER" "POSTGRES_PASSWORD" "POSTGRES_DB")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env || grep -q "^$var=.*your_.*_here" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing or incomplete environment variables:"
    printf "   - %s\n" "${missing_vars[@]}"
    echo "   Please update your .env file"
    exit 1
fi

echo "✅ Required environment variables configured"

# Check if n8n encryption key exists
if [ ! -f n8n/.n8n_encryption_key ]; then
    echo "❌ n8n encryption key not found"
    exit 1
fi

echo "✅ n8n encryption key found"

# Check if Docker services are running
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Docker services not running"
    echo "   Run: docker compose up -d"
    exit 1
fi

echo "✅ Docker services running"

# Test if n8n is accessible
if curl -s http://localhost:5678 >/dev/null 2>&1; then
    echo "✅ n8n accessible at http://localhost:5678"
else
    echo "❌ n8n not accessible at http://localhost:5678"
    exit 1
fi

# Test ElevenLabs API key
api_key=$(grep "^ELEVENLABS_API_KEY=" .env | cut -d'=' -f2)
if curl -s -H "xi-api-key: $api_key" "https://api.elevenlabs.io/v1/user" >/dev/null 2>&1; then
    echo "✅ ElevenLabs API key valid"
else
    echo "❌ ElevenLabs API key invalid or no internet connection"
    exit 1
fi

echo ""
echo "🎉 All checks passed! Your AgentCharlie TTS setup is ready."
echo ""
echo "Test your webhook:"
echo "curl -X POST http://localhost:5678/webhook/tts \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"text\": \"Hello from Charlie!\"}' \\"
echo "  --output test.mp3"

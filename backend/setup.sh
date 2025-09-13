#!/bin/bash

# AgentCharlie TTS Setup Script
# This script sets up the ElevenLabs TTS webhook environment

set -e

echo "🚀 Setting up AgentCharlie TTS Webhook..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your ElevenLabs API key and other settings"
    echo "   Required fields:"
    echo "   - ELEVENLABS_API_KEY=your_api_key_here"
    echo "   - ELEVENLABS_DEFAULT_VOICE_ID=your_voice_id_here"
else
    echo "✅ .env file already exists"
fi

# Create n8n encryption key if it doesn't exist
if [ ! -f n8n/.n8n_encryption_key ]; then
    echo "🔐 Generating n8n encryption key..."
    openssl rand -base64 32 > n8n/.n8n_encryption_key
    echo "✅ n8n encryption key generated"
else
    echo "✅ n8n encryption key already exists"
fi

# Start the services
echo "🐳 Starting Docker services..."
docker compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Visit http://localhost:5678 to access n8n"
    echo "2. Import the workflow from workflows/elevenlabs-tts-webhook.json"
    echo "3. Make sure to fill in your .env file with:"
    echo "   - ElevenLabs API key"
    echo "   - Your voice ID (or use default voices)"
    echo ""
    echo "Test your webhook:"
    echo "curl -X POST http://localhost:5678/webhook/tts \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"text\": \"Hello from Charlie!\"}'"
else
    echo "❌ Services failed to start. Check logs with: docker compose logs"
    exit 1
fi

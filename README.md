# Agent Charlie - AI Agent Marketplace Platform

A comprehensive AI agent marketplace platform built with React, n8n workflows, and modern web technologies. This platform allows users to discover, compare, and interact with various AI agents through an intuitive interface.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CarlosViking394/agent-charlie-monorepo)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker & Docker Compose
- Vercel CLI (for deployment)

### Installation
```bash
# Clone the repository
git clone https://github.com/CarlosViking394/agent-charlie-monorepo.git
cd agent-charlie-monorepo

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Set up environment
cp env.template .env
# Edit .env with your API keys and configuration

# Start development environment
npm run docker:dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **n8n Workflows**: http://localhost:5678 
- **Database**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379

## 🏗️ Architecture

### Frontend (React + Vite)
- Modern React application with TypeScript
- Responsive design with Tailwind CSS
- Agent marketplace interface
- Text-to-Speech integration
- Comparison tools

### Backend (n8n + Docker)
- n8n workflow automation platform
- PostgreSQL database
- Redis for caching and sessions
- ElevenLabs TTS integration
- Supabase integration

### Deployment
- **Frontend**: Vercel
- **Backend**: Docker containers (can be deployed to Railway, Render, or self-hosted)
- **Tunnel**: Cloudflare (for n8n webhook access)

## 🔧 Features

- **Agent Discovery**: Browse and search AI agents by category
- **Agent Comparison**: Side-by-side comparison tool
- **Text-to-Speech**: ElevenLabs integration for voice generation
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data from n8n workflows
- **Modern UI**: Clean, professional interface with smooth animations

## 📁 Project Structure

```
agent-charlie-monorepo/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and service layers
│   │   ├── styles/          # CSS and styling
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # n8n workflows and Docker setup
│   ├── workflows/           # n8n workflow definitions
│   ├── cloudflare/         # Cloudflare tunnel configuration
│   ├── docker-compose.yml   # Production Docker setup
│   ├── docker-compose.dev.yml # Development Docker setup
│   └── package.json
├── docs/                    # Documentation
├── scripts/                 # Deployment and utility scripts
├── vercel.json             # Vercel deployment configuration
├── env.template            # Environment variables template
└── README.md
```

## 🚀 Deployment

### Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Backend Options

#### Option A: Railway (Recommended)
1. Connect GitHub repository to Railway
2. Deploy the `backend/` directory
3. Set environment variables

#### Option B: Self-hosted
```bash
cd backend/
docker-compose up -d
```

#### Option C: Render
1. Create new Web Service from GitHub
2. Set root directory to `backend/`
3. Configure environment variables

### Environment Variables

Create a `.env` file from `env.template`:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=agent_charlie_dev

# n8n Configuration
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=http
WEBHOOK_URL=http://localhost:5678/
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=secure_password

# ElevenLabs TTS
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_DEFAULT_VOICE_ID=your_voice_id
ELEVENLABS_MODEL_ID=eleven_multilingual_v3

# Supabase (optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key
```

## 🛠️ Development

### Local Development
```bash
# Start all services
npm run docker:dev

# View logs
npm run docker:dev:logs

# Stop services
npm run docker:dev:stop

# Frontend only (if backend is running separately)
cd frontend && npm run dev

# Backend only
cd backend && docker-compose up
```

### Building
```bash
# Build frontend
cd frontend && npm run build

# Build backend Docker images
cd backend && docker-compose build
```

### Testing
```bash
# Frontend tests
cd frontend && npm test

# Backend health check
curl http://localhost:5678/

# TTS webhook test
curl -X POST http://localhost:5678/webhook/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

## 🔧 Configuration

### Cloudflare Tunnel (Optional)
For production webhook access:

1. Install cloudflared
2. Create tunnel: `cloudflared tunnel create agent-charlie`
3. Configure DNS: Point subdomain to tunnel
4. Update `backend/cloudflare/config.yml`
5. Run: `cloudflared tunnel run agent-charlie`

### n8n Workflows
1. Access n8n at http://localhost:5678
2. Import workflows from `backend/workflows/`
3. Configure API credentials
4. Activate workflows

## 📖 API Documentation

### TTS Endpoint
```bash
POST /webhook/tts
Content-Type: application/json

{
  "text": "Text to convert to speech",
  "voiceId": "optional_voice_id"
}
```

### Agent Data
Agents are currently loaded from mock data but can be connected to:
- Database queries
- External APIs
- n8n workflow responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issues](https://github.com/CarlosViking394/agent-charlie-monorepo/issues)
- 💬 [Discussions](https://github.com/CarlosViking394/agent-charlie-monorepo/discussions)

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Workflow automation by [n8n](https://n8n.io/)
- Voice generation by [ElevenLabs](https://elevenlabs.io/)
- UI components inspired by modern design systems
- Hosted on [Vercel](https://vercel.com/) and [Railway](https://railway.app/)

---

**Made with ❤️ by CarlosViking394**
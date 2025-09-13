# Agent Charlie Frontend

This is the frontend application for the Agent Charlie multi-agent system.

## Overview
The frontend provides a user interface for interacting with the Agent Charlie backend system, allowing users to communicate with various specialized agents through a unified chat interface.

## Features
- Real-time chat interface
- Multi-agent routing visualization
- Context-aware responses
- Session management
- Agent status indicators

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Environment Variables
Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## Project Structure
```
Agent-Charlie-Frontend/
├── frontend-snippets/     # React component snippets
│   └── AgentInterface.tsx
├── index.html            # Main HTML file
├── styles.css            # Global styles
├── src/                  # Source files (to be created)
├── package.json          # Dependencies
└── README.md            # This file
```

## Deployment
This frontend can be deployed to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

## Related Projects
- Backend: [Agent Charlie Backend](../agent-Charlie)

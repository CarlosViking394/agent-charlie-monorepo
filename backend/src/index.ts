import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'agent-charlie-backend'
  });
});

// API routes
app.get('/api/status', (_req, res) => {
  res.json({ 
    message: 'Agent Charlie Backend API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoint for agent interactions
app.post('/api/agents/query', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    // This is where you would integrate with your n8n workflows
    // For now, return a mock response
    res.json({
      response: `Processed query: ${query}`,
      context: context || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing agent query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for n8n integration
app.post('/webhook/n8n/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const payload = req.body;
    
    console.log(`Received webhook for workflow ${workflowId}:`, payload);
    
    // Forward to n8n or process as needed
    res.json({ 
      success: true, 
      workflowId,
      message: 'Webhook received successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Agent Charlie Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
  console.log(`🪝 Webhooks: http://localhost:${PORT}/webhook`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

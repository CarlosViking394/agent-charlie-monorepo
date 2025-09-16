import { createServer } from 'http';
import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE',
  'JWT_SECRET',
  'OPENAI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('📋 Please check your .env file and ensure all required variables are set');
  process.exit(1);
}

// Start server
server.listen(PORT, () => {
  console.log('🤖 ═══════════════════════════════════════════════');
  console.log('🚀 Agent Charlie Backend v2.0 - Multi-Agent System');
  console.log('🤖 ═══════════════════════════════════════════════');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📊 Endpoints:');
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API status:   http://localhost:${PORT}/api/status`);
  console.log(`   Auth:         http://localhost:${PORT}/auth`);
  console.log(`   Agents:       http://localhost:${PORT}/api/agents`);
  console.log(`   Webhooks:     http://localhost:${PORT}/webhook`);
  console.log('');
  console.log('🤖 Active Agents:');
  console.log('   ✅ Charlie (Root Orchestrator)');
  console.log('   ✅ Restaurant Agent');
  console.log('   ✅ Banking Agent');
  console.log('   ✅ Travel Agent');
  console.log('   ✅ Healthcare Agent');
  console.log('   ✅ Entertainment Agent');
  console.log('');
  console.log('🔐 Authentication:');
  console.log('   ✅ Google OAuth');
  console.log('   ✅ GitHub OAuth');
  console.log('   ✅ Microsoft OAuth');
  console.log('   ✅ Apple OAuth');
  console.log('   ✅ Email/Password');
  console.log('');
  console.log('🔗 Integrations:');
  console.log('   ✅ Supabase Database');
  console.log('   ✅ OpenAI GPT-4');
  console.log('   ✅ n8n Workflows');
  console.log('   ✅ ElevenLabs TTS');
  console.log('🤖 ═══════════════════════════════════════════════');
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
  
  server.close(() => {
    console.log('🔌 HTTP server closed');
    console.log('🤖 Agent Charlie backend stopped');
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

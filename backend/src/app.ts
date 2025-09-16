import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './api/routes/auth.routes';
import agentsRoutes from './api/routes/agents.routes';

// Import middleware
import { authMiddleware } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://*.supabase.co"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://agentcharlie.live',
      'https://agent-charlie-monorepo.vercel.app'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'agent-charlie-backend',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API status endpoint (public)
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Agent Charlie Backend API v2.0 is running',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: [
      'multi_agent_orchestration',
      'oauth_authentication', 
      'speech_recognition',
      'intent_classification',
      'n8n_workflow_integration'
    ],
    agents: {
      total: 6,
      active: 6,
      types: ['root', 'restaurant', 'bank', 'travel', 'healthcare', 'entertainment']
    }
  });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/api/agents', agentsRoutes);

// N8N webhook integration
app.post('/webhook/n8n/:workflowId', 
  authMiddleware.optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { workflowId } = req.params;
      const payload = req.body;
      
      console.log(`📥 n8n webhook received: ${workflowId}`, payload);
      
      // TODO: Process workflow result and update agent state
      // For now, just log and acknowledge
      
      res.json({
        success: true,
        workflowId,
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('n8n webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// Conversation history
router.get('/conversations', 
  authMiddleware.requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Query user's conversation history from database
      res.json({
        conversations: [],
        total: 0,
        message: 'Conversation history not yet implemented'
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to retrieve conversations' });
    }
  }
);

// User analytics (for logged-in users)
router.get('/analytics', 
  authMiddleware.requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Generate user analytics
      res.json({
        totalInteractions: 0,
        favoriteAgents: [],
        averageResponseTime: 0,
        lastActivity: new Date().toISOString(),
        message: 'Analytics not yet implemented'
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
  }
);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

export default app;

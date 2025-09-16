import { Router, Request, Response } from 'express';
import { CharlieAgent } from '../../agents/root/charlie.agent';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { AgentMessage, MessageType, UserMessage, Context } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const charlieAgent = new CharlieAgent();

// Initialize Charlie agent
charlieAgent.initialize();

// Main chat endpoint - process user messages
router.post('/chat', 
  authMiddleware.optionalAuth,
  authMiddleware.rateLimitByUser(50, 60000), // 50 requests per minute
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, conversationId, context } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({
          error: 'Message is required'
        });
      }

      // Create user message
      const userMessage: UserMessage = {
        id: uuidv4(),
        content: message,
        timestamp: new Date(),
        userId: req.user?.id || 'anonymous'
      };

      // Build context
      const requestContext: Context = {
        userId: req.user?.id || 'anonymous',
        conversationHistory: context?.history || [],
        userPreferences: req.user?.preferences || {
          preferredAgents: [],
          communicationStyle: 'professional',
          timezone: 'UTC',
          language: 'en',
          notificationSettings: {
            email: true,
            sms: false,
            push: true
          }
        },
        activeAgents: [],
        sharedState: new Map(),
        sessionStartTime: new Date(),
        lastActivity: new Date()
      };

      // Create agent message
      const agentMessage: AgentMessage = {
        id: uuidv4(),
        timestamp: new Date(),
        from: {
          id: 'user',
          name: req.user?.name || 'Anonymous User',
          type: 'user' as any,
          version: '1.0.0'
        },
        to: charlieAgent.getIdentifier(),
        type: MessageType.USER_REQUEST,
        payload: {
          intent: 'unknown',
          context: requestContext,
          data: { text: message, query: message }
        },
        sessionId: req.sessionID || uuidv4(),
        correlationId: uuidv4()
      };

      // Process with Charlie
      const response = await charlieAgent.process(agentMessage, requestContext);

      // TODO: Save conversation to database
      
      res.json({
        success: true,
        response: {
          id: response.id,
          message: response.response,
          confidence: response.confidence,
          timestamp: response.timestamp,
          agent: {
            id: response.agentId,
            name: 'Charlie'
          },
          actions: response.actions,
          nextSuggestedAgents: response.nextSuggestedAgents
        },
        conversationId: conversationId || uuidv4()
      });

    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({
        error: 'Failed to process message',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Get available agents
router.get('/', authMiddleware.optionalAuth, async (req: Request, res: Response) => {
  try {
    // TODO: Query from database
    const agents = [
      {
        id: 'charlie-root-001',
        name: 'Charlie',
        type: 'root',
        description: 'Your personal assistant and agent orchestrator',
        capabilities: charlieAgent.getCapabilities(),
        status: charlieAgent.getStatus(),
        avatar: '🤖'
      }
      // Add other agents here
    ];

    res.json({
      agents,
      total: agents.length,
      active: agents.filter(a => a.status.active).length
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to retrieve agents' });
  }
});

// Get specific agent info
router.get('/:agentId', authMiddleware.optionalAuth, async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    
    // For now, only Charlie is available
    if (agentId === 'charlie-root-001') {
      res.json({
        agent: {
          id: 'charlie-root-001',
          name: 'Charlie',
          type: 'root',
          description: 'Your personal assistant and agent orchestrator',
          capabilities: charlieAgent.getCapabilities(),
          status: charlieAgent.getStatus(),
          avatar: '🤖'
        }
      });
    } else {
      res.status(404).json({ error: 'Agent not found' });
    }
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Failed to retrieve agent' });
  }
});

// Direct agent communication (for advanced users)
router.post('/:agentId/message', 
  authMiddleware.requireAuth,
  authMiddleware.rateLimitByUser(30, 60000),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { agentId } = req.params;
      const { message, context } = req.body;

      if (agentId !== 'charlie-root-001') {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Similar to chat endpoint but for direct agent communication
      // TODO: Implement direct agent messaging
      
      res.json({
        success: true,
        message: 'Direct agent communication not yet implemented',
        agentId
      });
    } catch (error) {
      console.error('Direct agent message error:', error);
      res.status(500).json({ error: 'Failed to send message to agent' });
    }
  }
);

// Agent health check
router.get('/:agentId/health', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    
    if (agentId === 'charlie-root-001') {
      const status = charlieAgent.getStatus();
      res.json({
        agent: agentId,
        healthy: status.active,
        status: status.active ? 'active' : 'inactive',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({ error: 'Agent not found' });
    }
  } catch (error) {
    console.error('Agent health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

export default router;


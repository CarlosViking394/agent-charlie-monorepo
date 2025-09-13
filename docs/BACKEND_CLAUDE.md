# Agent Charlie - Multi-Agent Backend System

## Project Overview
Agent Charlie is a sophisticated multi-agent orchestration system designed to coordinate interactions between users and specialized service agents. The root agent (Charlie) acts as an intelligent router, directing user requests to appropriate specialized agents based on context and intent.

## Architecture Fundamentals

### Core Components

#### 1. Root Agent (Charlie)
- **Role**: Primary orchestrator and router
- **Responsibilities**:
  - Intent classification and routing
  - Context management across agent interactions
  - Session state maintenance
  - Response aggregation from multiple agents
  - Fallback handling for unmatched requests

#### 2. Specialized Service Agents
Each specialized agent handles domain-specific tasks:

- **Restaurant Agent**
  - Reservation management
  - Menu inquiries
  - Dietary restriction handling
  - Restaurant recommendations
  - Order tracking

- **Bank Agent**
  - Account balance inquiries
  - Transaction history
  - Payment processing
  - Fraud detection alerts
  - Financial advice routing

- **Travel Agent**
  - Flight bookings
  - Hotel reservations
  - Itinerary planning
  - Travel recommendations
  - Visa/documentation guidance

- **Healthcare Agent**
  - Appointment scheduling
  - Medical record access
  - Prescription refills
  - Health advice routing
  - Insurance inquiries

- **Entertainment Agent**
  - Event bookings
  - Movie/show recommendations
  - Ticket purchases
  - Venue information

## Technical Architecture

### Backend Structure
```
agent-charlie-backend/
├── src/
│   ├── agents/
│   │   ├── root/
│   │   │   ├── charlie.agent.ts
│   │   │   ├── intent-classifier.ts
│   │   │   └── context-manager.ts
│   │   ├── restaurant/
│   │   │   ├── restaurant.agent.ts
│   │   │   └── restaurant.service.ts
│   │   ├── bank/
│   │   │   ├── bank.agent.ts
│   │   │   └── bank.service.ts
│   │   ├── travel/
│   │   │   ├── travel.agent.ts
│   │   │   └── travel.service.ts
│   │   └── shared/
│   │       ├── base.agent.ts
│   │       └── agent.interface.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rate-limiter.ts
│   │   └── error-handler.ts
│   ├── services/
│   │   ├── llm/
│   │   │   ├── openai.service.ts
│   │   │   └── anthropic.service.ts
│   │   ├── database/
│   │   │   ├── supabase.service.ts
│   │   │   └── redis.service.ts
│   │   └── queue/
│   │       └── bull.service.ts
│   ├── api/
│   │   ├── routes/
│   │   │   ├── agent.routes.ts
│   │   │   ├── health.routes.ts
│   │   │   └── webhook.routes.ts
│   │   └── controllers/
│   │       └── agent.controller.ts
│   └── config/
│       ├── database.config.ts
│       ├── agent.config.ts
│       └── llm.config.ts
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── n8n/
│   └── workflows/
└── tests/
    ├── unit/
    └── integration/
```

### Agent Communication Protocol

#### Message Format
```typescript
interface AgentMessage {
  id: string;
  timestamp: Date;
  from: AgentIdentifier;
  to: AgentIdentifier;
  type: MessageType;
  payload: {
    intent: string;
    context: Context;
    data: any;
    metadata?: Metadata;
  };
  sessionId: string;
  correlationId: string;
}

interface Context {
  userId: string;
  conversationHistory: Message[];
  userPreferences: UserPreferences;
  activeAgents: AgentIdentifier[];
  sharedState: Map<string, any>;
}
```

#### Routing Logic
```typescript
class IntentClassifier {
  classify(userInput: string, context: Context): Intent {
    // Use LLM to classify intent
    // Return matched agent and confidence score
  }
}

class Charlie {
  async route(message: UserMessage): Promise<AgentResponse> {
    const intent = await this.classifier.classify(message);
    
    if (intent.requiresMultipleAgents) {
      return this.orchestrateMultipleAgents(intent.agents, message);
    }
    
    return this.delegateToAgent(intent.primaryAgent, message);
  }
}
```

## Implementation Guidelines

### 1. Agent Development
Each agent should:
- Extend the base `Agent` class
- Implement standard interface methods
- Handle specific domain logic
- Maintain state consistency
- Provide fallback responses

### 2. State Management
- Use Redis for session state
- Implement distributed locking for concurrent access
- Store conversation history in Supabase
- Cache frequent queries

### 3. Error Handling
- Implement circuit breakers for external services
- Graceful degradation when agents are unavailable
- Comprehensive logging and monitoring
- User-friendly error messages

### 4. Security Considerations
- JWT-based authentication
- Rate limiting per user/agent
- Input sanitization
- Encrypted communication between agents
- Audit logging for sensitive operations

## Integration Points

### External Services
- **LLM Providers**: OpenAI, Anthropic Claude
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Queue**: Bull/Redis
- **Workflow**: n8n
- **Monitoring**: Prometheus/Grafana

### API Endpoints
```
POST   /api/v1/chat           - Main chat endpoint
GET    /api/v1/agents         - List available agents
POST   /api/v1/agents/:id     - Direct agent communication
GET    /api/v1/session/:id    - Retrieve session history
GET    /api/health            - Health check
POST   /api/webhooks/n8n      - n8n workflow triggers
```

## Development Workflow

### Local Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev

# Run tests
npm test
```

### Environment Variables
```
# LLM Configuration
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Database
SUPABASE_URL=
SUPABASE_ANON_KEY=
REDIS_URL=

# Agent Configuration
CHARLIE_AGENT_ID=
MAX_CONVERSATION_LENGTH=
AGENT_TIMEOUT_MS=

# Security
JWT_SECRET=
RATE_LIMIT_PER_MINUTE=
```

## Testing Strategy

### Unit Tests
- Test individual agent logic
- Mock external dependencies
- Validate routing decisions
- Test error scenarios

### Integration Tests
- Test agent-to-agent communication
- Validate end-to-end flows
- Test with real LLM responses
- Performance testing

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t agent-charlie-backend .

# Run with docker-compose
docker-compose up -d
```

### Production Considerations
- Horizontal scaling for agent instances
- Load balancing between multiple Charlie instances
- Database connection pooling
- Implement caching strategies
- Set up monitoring and alerting

## Future Enhancements

1. **Advanced Orchestration**
   - Multi-agent collaboration
   - Parallel agent execution
   - Dynamic agent discovery

2. **Learning Capabilities**
   - Intent classification improvement
   - User preference learning
   - Performance optimization

3. **Additional Agents**
   - Legal services
   - Education/tutoring
   - Real estate
   - Customer support

4. **Enhanced Features**
   - Voice interaction
   - Multi-language support
   - Proactive notifications
   - Agent marketplace

## Troubleshooting

### Common Issues
1. **Agent timeout**: Increase `AGENT_TIMEOUT_MS`
2. **High latency**: Check Redis connection, implement caching
3. **Intent misclassification**: Fine-tune classifier prompts
4. **Session state loss**: Verify Redis persistence settings

## Support and Contribution

For questions or contributions:
- Review the codebase documentation
- Check existing issues on GitHub
- Follow the contribution guidelines
- Run linting and tests before submitting PRs

---

*This document serves as the foundational guide for the Agent Charlie backend system. It should be updated as the architecture evolves.*
import { AgentIdentifier, AgentMessage, AgentResponse, Context, Intent, AgentType, AgentConfig } from '../../types';

export abstract class BaseAgent {
  protected identifier: AgentIdentifier;
  protected config: AgentConfig;
  protected isActive: boolean = true;

  constructor(config: AgentConfig) {
    this.config = config;
    this.identifier = {
      id: config.id,
      name: config.name,
      type: config.type,
      version: '1.0.0'
    };
  }

  // Abstract methods that each agent must implement
  abstract canHandle(intent: Intent): boolean;
  abstract process(message: AgentMessage, context: Context): Promise<AgentResponse>;
  abstract getCapabilities(): string[];

  // Common methods available to all agents
  async initialize(): Promise<void> {
    console.log(`🤖 Initializing agent: ${this.identifier.name}`);
    this.isActive = true;
  }

  async shutdown(): Promise<void> {
    console.log(`🛑 Shutting down agent: ${this.identifier.name}`);
    this.isActive = false;
  }

  getIdentifier(): AgentIdentifier {
    return this.identifier;
  }

  getStatus(): { active: boolean; config: AgentConfig } {
    return {
      active: this.isActive,
      config: this.config
    };
  }

  // Validate message format
  protected validateMessage(message: AgentMessage): boolean {
    return !!(
      message.id &&
      message.from &&
      message.to &&
      message.type &&
      message.payload &&
      message.sessionId
    );
  }

  // Create response template
  protected createResponse(
    message: AgentMessage,
    response: string,
    confidence: number = 1.0,
    actions?: any[]
  ): AgentResponse {
    return {
      id: this.generateId(),
      agentId: this.identifier.id,
      response,
      confidence,
      timestamp: new Date(),
      actions,
      nextSuggestedAgents: []
    };
  }

  // Generate unique ID
  protected generateId(): string {
    return `${this.identifier.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Error handling
  protected handleError(error: any, context: string): AgentResponse {
    console.error(`Error in ${this.identifier.name} (${context}):`, error);
    
    return {
      id: this.generateId(),
      agentId: this.identifier.id,
      response: "I'm sorry, I encountered an issue processing your request. Please try again.",
      confidence: 0,
      timestamp: new Date(),
      actions: [{
        type: 'escalate',
        payload: { error: error.message, context }
      }]
    };
  }

  // Log agent activity
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: this.identifier.name,
      level,
      message,
      data
    };
    
    console.log(`[${level.toUpperCase()}] ${this.identifier.name}: ${message}`, data || '');
  }
}


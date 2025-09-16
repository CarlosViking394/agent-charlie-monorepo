import { BaseAgent } from '../shared/base.agent';
import { IntentClassifier } from './intent-classifier';
import { AgentMessage, AgentResponse, Context, Intent, AgentType, UserMessage } from '../../types';

export class CharlieAgent extends BaseAgent {
  private intentClassifier: IntentClassifier;
  private specializedAgents: Map<AgentType, BaseAgent> = new Map();

  constructor() {
    super({
      id: 'charlie-root-001',
      name: 'Charlie',
      type: AgentType.ROOT,
      enabled: true,
      maxConcurrency: 100,
      timeout: 30000,
      retryAttempts: 3,
      llmConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      }
    });

    this.intentClassifier = new IntentClassifier();
  }

  canHandle(intent: Intent): boolean {
    // Charlie can handle all intents as the orchestrator
    return true;
  }

  async process(message: AgentMessage, context: Context): Promise<AgentResponse> {
    try {
      this.log('info', 'Processing user request', { messageId: message.id });

      // Extract user input from message
      const userInput = message.payload.data.text || message.payload.data.query;
      
      if (!userInput) {
        return this.createResponse(message, "I didn't receive any input. How can I help you today?", 0.5);
      }

      // Classify the intent
      const intent = await this.intentClassifier.classify(userInput, context);
      
      this.log('info', 'Intent classified', { 
        intent: intent.name, 
        confidence: intent.confidence,
        primaryAgent: intent.primaryAgent
      });

      // Route to appropriate agent or handle directly
      if (intent.confidence > 0.8 && intent.primaryAgent !== AgentType.ROOT) {
        return await this.delegateToSpecializedAgent(intent, message, context);
      } else {
        return await this.handleDirectly(intent, message, context);
      }
    } catch (error) {
      this.log('error', 'Error processing message', error);
      return this.handleError(error, 'process');
    }
  }

  getCapabilities(): string[] {
    return [
      'intent_classification',
      'agent_orchestration',
      'context_management',
      'conversation_routing',
      'fallback_handling',
      'multi_agent_coordination'
    ];
  }

  // Register specialized agents
  registerAgent(agent: BaseAgent): void {
    this.specializedAgents.set(agent.getIdentifier().type, agent);
    this.log('info', `Registered specialized agent: ${agent.getIdentifier().name}`);
  }

  // Get conversation summary
  async getConversationSummary(context: Context): Promise<string> {
    try {
      if (context.conversationHistory.length === 0) {
        return "This is the start of our conversation.";
      }

      const recentMessages = context.conversationHistory.slice(-5);
      const messages = recentMessages.map(msg => `User: ${msg.content}`).join('\n');

      const response = await this.intentClassifier['openai'].chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Summarize this conversation in 1-2 sentences, focusing on what the user is looking for.'
          },
          {
            role: 'user',
            content: `Conversation:\n${messages}`
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      });

      return response.choices[0]?.message?.content || 'Conversation summary unavailable';
    } catch (error) {
      this.log('error', 'Error generating conversation summary', error);
      return 'Recent conversation context available';
    }
  }

  // Private methods
  private async delegateToSpecializedAgent(
    intent: Intent, 
    message: AgentMessage, 
    context: Context
  ): Promise<AgentResponse> {
    const specializedAgent = this.specializedAgents.get(intent.primaryAgent);
    
    if (!specializedAgent) {
      this.log('warn', `No specialized agent found for type: ${intent.primaryAgent}`);
      return await this.handleDirectly(intent, message, context);
    }

    try {
      // Create delegated message
      const delegatedMessage: AgentMessage = {
        ...message,
        from: this.identifier,
        to: specializedAgent.getIdentifier(),
        payload: {
          ...message.payload,
          intent: intent.name,
          data: { ...message.payload.data, ...intent.parameters }
        }
      };

      const response = await specializedAgent.process(delegatedMessage, context);
      
      this.log('info', `Delegated to ${specializedAgent.getIdentifier().name}`, {
        confidence: response.confidence
      });

      return response;
    } catch (error) {
      this.log('error', `Delegation failed to ${intent.primaryAgent}`, error);
      return await this.handleDirectly(intent, message, context);
    }
  }

  private async handleDirectly(
    intent: Intent,
    message: AgentMessage,
    context: Context
  ): Promise<AgentResponse> {
    const userInput = message.payload.data.text || message.payload.data.query;
    
    // Generate conversational response using LLM
    try {
      const conversationSummary = await this.getConversationSummary(context);
      
      const response = await this.intentClassifier['openai'].chat.completions.create({
        model: this.config.llmConfig.model,
        messages: [
          {
            role: 'system',
            content: `You are Charlie, a helpful and professional personal assistant. 
            You help users find and connect with service agents like plumbers, tutors, consultants, etc.
            
            Key guidelines:
            - Be warm, professional, and helpful
            - Ask clarifying questions when needed
            - Suggest specific next steps
            - If you can't help directly, recommend the right type of specialist
            - Keep responses concise but informative
            
            Current conversation context: ${conversationSummary}
            
            Detected intent: ${intent.name} (confidence: ${intent.confidence})
            User preferences: ${context.userPreferences.communicationStyle} communication style`
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        temperature: this.config.llmConfig.temperature,
        max_tokens: this.config.llmConfig.maxTokens
      });

      const responseText = response.choices[0]?.message?.content || 
        "I'm here to help you find the right service agents. What do you need assistance with?";

      // Suggest next actions based on intent
      const actions = this.suggestNextActions(intent, userInput);

      return this.createResponse(message, responseText, intent.confidence, actions);
    } catch (error) {
      this.log('error', 'LLM response generation failed', error);
      return this.createFallbackResponse(message, intent);
    }
  }

  private suggestNextActions(intent: Intent, userInput: string): any[] {
    const actions = [];

    // Suggest agent connections based on intent
    if (intent.primaryAgent !== AgentType.ROOT && intent.confidence > 0.7) {
      actions.push({
        type: 'redirect',
        payload: {
          agentType: intent.primaryAgent,
          reason: `Based on your request, I think our ${intent.primaryAgent.toLowerCase()} specialist can help you better.`
        }
      });
    }

    // Suggest follow-up questions for low confidence
    if (intent.confidence < 0.6) {
      actions.push({
        type: 'workflow',
        payload: {
          workflowType: 'clarification',
          suggestedQuestions: [
            "Could you provide more details about what you're looking for?",
            "What's your timeline for this request?",
            "Do you have any specific preferences or requirements?"
          ]
        }
      });
    }

    return actions;
  }

  private createFallbackResponse(message: AgentMessage, intent: Intent): AgentResponse {
    let response = "I'm here to help you find the right service agents. ";
    
    switch (intent.primaryAgent) {
      case AgentType.RESTAURANT:
        response += "Are you looking for dining recommendations or restaurant reservations?";
        break;
      case AgentType.BANK:
        response += "Do you need help with banking or financial services?";
        break;
      case AgentType.TRAVEL:
        response += "Are you planning a trip or looking for travel assistance?";
        break;
      case AgentType.HEALTHCARE:
        response += "Do you need help finding healthcare services or booking appointments?";
        break;
      case AgentType.ENTERTAINMENT:
        response += "Are you looking for entertainment options or event tickets?";
        break;
      default:
        response += "Could you tell me more about what kind of help you need?";
    }

    return this.createResponse(message, response, 0.8);
  }
}

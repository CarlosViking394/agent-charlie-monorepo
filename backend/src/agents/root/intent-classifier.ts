import OpenAI from 'openai';
import { Intent, AgentType, UserMessage, Context } from '../../types';

export class IntentClassifier {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async classify(userInput: string, context: Context): Promise<Intent> {
    try {
      const prompt = this.buildClassificationPrompt(userInput, context);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert intent classifier for Agent Charlie. 
            Analyze user inputs and classify them into appropriate agent types.
            
            Available agent types:
            - RESTAURANT: dining, reservations, food orders
            - BANK: finance, payments, account management
            - TRAVEL: flights, hotels, trips, bookings
            - HEALTHCARE: appointments, medical, wellness
            - ENTERTAINMENT: events, movies, shows, tickets
            - GENERAL: everything else
            
            Response format (JSON only):
            {
              "name": "intent_name",
              "confidence": 0.95,
              "primaryAgent": "RESTAURANT",
              "secondaryAgents": ["BANK"],
              "requiresMultipleAgents": false,
              "parameters": {"location": "NYC", "time": "tonight"},
              "urgency": "medium"
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No classification result');
      }

      const classification = JSON.parse(result);
      return this.validateAndNormalizeIntent(classification);
    } catch (error) {
      console.error('Intent classification error:', error);
      
      // Fallback classification
      return this.getFallbackIntent(userInput);
    }
  }

  private buildClassificationPrompt(userInput: string, context: Context): string {
    let prompt = `Classify this user input: "${userInput}"`;
    
    // Add conversation history context
    if (context.conversationHistory.length > 0) {
      const recentMessages = context.conversationHistory.slice(-3);
      prompt += `\n\nRecent conversation context:\n`;
      recentMessages.forEach((msg, i) => {
        prompt += `${i + 1}. "${msg.content}"\n`;
      });
    }

    // Add user preferences
    if (context.userPreferences.preferredAgents.length > 0) {
      prompt += `\nUser's preferred agents: ${context.userPreferences.preferredAgents.join(', ')}`;
    }

    return prompt;
  }

  private validateAndNormalizeIntent(classification: any): Intent {
    return {
      name: classification.name || 'general_inquiry',
      confidence: Math.min(Math.max(classification.confidence || 0.5, 0), 1),
      primaryAgent: this.normalizeAgentType(classification.primaryAgent),
      secondaryAgents: classification.secondaryAgents?.map((a: string) => this.normalizeAgentType(a)) || [],
      requiresMultipleAgents: Boolean(classification.requiresMultipleAgents),
      parameters: classification.parameters || {},
      urgency: this.normalizeUrgency(classification.urgency)
    };
  }

  private normalizeAgentType(agentType: string): AgentType {
    const upperType = agentType.toUpperCase();
    if (Object.values(AgentType).includes(upperType as AgentType)) {
      return upperType as AgentType;
    }
    return AgentType.GENERAL;
  }

  private normalizeUrgency(urgency: string): 'low' | 'medium' | 'high' | 'urgent' {
    const normalized = urgency?.toLowerCase();
    if (['low', 'medium', 'high', 'urgent'].includes(normalized)) {
      return normalized as 'low' | 'medium' | 'high' | 'urgent';
    }
    return 'medium';
  }

  private getFallbackIntent(userInput: string): Intent {
    // Simple keyword-based fallback
    const input = userInput.toLowerCase();
    
    let primaryAgent = AgentType.GENERAL;
    let urgency: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

    // Basic keyword matching
    if (input.includes('restaurant') || input.includes('food') || input.includes('meal')) {
      primaryAgent = AgentType.RESTAURANT;
    } else if (input.includes('bank') || input.includes('payment') || input.includes('money')) {
      primaryAgent = AgentType.BANK;
    } else if (input.includes('travel') || input.includes('flight') || input.includes('hotel')) {
      primaryAgent = AgentType.TRAVEL;
    } else if (input.includes('doctor') || input.includes('health') || input.includes('medical')) {
      primaryAgent = AgentType.HEALTHCARE;
    } else if (input.includes('movie') || input.includes('show') || input.includes('event')) {
      primaryAgent = AgentType.ENTERTAINMENT;
    }

    // Check for urgency keywords
    if (input.includes('urgent') || input.includes('emergency') || input.includes('asap')) {
      urgency = 'urgent';
    } else if (input.includes('important') || input.includes('soon')) {
      urgency = 'high';
    }

    return {
      name: 'fallback_classification',
      confidence: 0.6,
      primaryAgent,
      secondaryAgents: [],
      requiresMultipleAgents: false,
      parameters: {},
      urgency
    };
  }
}

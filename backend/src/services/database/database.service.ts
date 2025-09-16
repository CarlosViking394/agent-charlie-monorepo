import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Session, UserMessage, Context } from '../../types';

export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
  }

  // Initialize database (run schema if needed)
  async initialize(): Promise<void> {
    try {
      console.log('🗄️ Initializing database connection...');
      
      // Test connection
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
      }
      
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        provider: userData.provider,
        provider_id: userData.providerId,
        preferences: userData.preferences || {},
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return this.mapDatabaseUserToUser(data);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseUserToUser(data);
  }

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseUserToUser(data);
  }

  // Conversation operations
  async createConversation(userId: string, title?: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: title || 'New Conversation',
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data.id;
  }

  async saveMessage(
    conversationId: string,
    userId: string | null,
    content: string,
    messageType: string = 'user_message',
    agentId?: string,
    intent?: string,
    confidence?: number,
    metadata?: any
  ): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        agent_id: agentId,
        content,
        message_type: messageType,
        intent,
        confidence,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to save message:', error);
      // Don't throw error - message saving shouldn't break the flow
    }
  }

  async getConversationHistory(conversationId: string, limit: number = 50): Promise<UserMessage[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }

    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      userId: msg.user_id || 'system',
      intent: msg.intent,
      sentiment: msg.metadata?.sentiment
    }));
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(`
        id,
        title,
        summary,
        status,
        created_at,
        updated_at,
        messages (count)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to get user conversations:', error);
      return [];
    }

    return data || [];
  }

  // Agent operations
  async logAgentInteraction(
    sessionId: string,
    fromAgent: string,
    toAgent: string,
    messageId: string,
    intent: string,
    confidence: number,
    responseTimeMs: number,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('agent_interactions')
      .insert({
        session_id: sessionId,
        from_agent: fromAgent,
        to_agent: toAgent,
        message_id: messageId,
        intent,
        confidence,
        response_time_ms: responseTimeMs,
        success,
        error_message: errorMessage,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log agent interaction:', error);
    }
  }

  async getAgentAnalytics(agentId: string, timeRange: string = '24h'): Promise<any> {
    // TODO: Implement agent analytics
    return {
      totalInteractions: 0,
      successRate: 0,
      averageResponseTime: 0,
      timeRange
    };
  }

  // Utility methods
  private mapDatabaseUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      provider: dbUser.provider,
      providerId: dbUser.provider_id,
      preferences: dbUser.preferences || this.getDefaultPreferences(),
      createdAt: new Date(dbUser.created_at),
      lastLogin: new Date(dbUser.last_login),
      isActive: dbUser.is_active
    };
  }

  private getDefaultPreferences() {
    return {
      preferredAgents: [],
      communicationStyle: 'professional',
      timezone: 'UTC',
      language: 'en',
      notificationSettings: {
        email: true,
        sms: false,
        push: true
      }
    };
  }

  // Health check
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1);

      return {
        healthy: !error,
        details: {
          connected: !error,
          error: error?.message,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          connected: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

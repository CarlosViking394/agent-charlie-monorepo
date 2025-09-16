// Core Agent Types
export interface AgentIdentifier {
  id: string;
  name: string;
  type: AgentType;
  version: string;
}

export enum AgentType {
  ROOT = 'root',
  RESTAURANT = 'restaurant', 
  BANK = 'bank',
  TRAVEL = 'travel',
  HEALTHCARE = 'healthcare',
  ENTERTAINMENT = 'entertainment',
  GENERAL = 'general'
}

export enum MessageType {
  USER_REQUEST = 'user_request',
  AGENT_RESPONSE = 'agent_response',
  AGENT_DELEGATION = 'agent_delegation',
  CONTEXT_UPDATE = 'context_update',
  ERROR = 'error',
  SYSTEM = 'system'
}

export interface AgentMessage {
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

export interface Context {
  userId: string;
  conversationHistory: UserMessage[];
  userPreferences: UserPreferences;
  activeAgents: AgentIdentifier[];
  sharedState: Map<string, any>;
  sessionStartTime: Date;
  lastActivity: Date;
}

export interface UserMessage {
  id: string;
  content: string;
  timestamp: Date;
  userId: string;
  intent?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface AgentResponse {
  id: string;
  agentId: string;
  response: string;
  confidence: number;
  timestamp: Date;
  actions?: AgentAction[];
  nextSuggestedAgents?: AgentIdentifier[];
}

export interface AgentAction {
  type: 'redirect' | 'api_call' | 'workflow' | 'escalate';
  payload: any;
  requiresUserConfirmation?: boolean;
}

export interface UserPreferences {
  preferredAgents: string[];
  communicationStyle: 'formal' | 'casual' | 'professional';
  timezone: string;
  language: string;
  notificationSettings: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface Metadata {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  estimatedDuration?: number;
  requiresAuth?: boolean;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: AuthProvider;
  providerId: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

export enum AuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
  APPLE = 'apple',
  EMAIL = 'email'
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string[];
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface DeviceInfo {
  platform: string;
  browser: string;
  version: string;
  isMobile: boolean;
}

// Intent Classification
export interface Intent {
  name: string;
  confidence: number;
  primaryAgent: AgentType;
  secondaryAgents?: AgentType[];
  requiresMultipleAgents: boolean;
  parameters: Record<string, any>;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}

// Error Types
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public agentId?: string,
    public correlationId?: string
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string, public provider?: AuthProvider) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Configuration Types
export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  enabled: boolean;
  maxConcurrency: number;
  timeout: number;
  retryAttempts: number;
  llmConfig: {
    provider: 'openai' | 'anthropic';
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}


-- Agent Charlie Database Schema
-- Run this in your PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    provider VARCHAR(50) NOT NULL DEFAULT 'email',
    provider_id VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    summary TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table  
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id VARCHAR(100),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'user_message',
    intent VARCHAR(100),
    confidence DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    capabilities JSONB DEFAULT '[]',
    config JSONB DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent interactions table
CREATE TABLE IF NOT EXISTS agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    from_agent VARCHAR(100),
    to_agent VARCHAR(100),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    intent VARCHAR(100),
    confidence DECIMAL(3,2),
    response_time_ms INTEGER,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table (normalized)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, key)
);

-- Agent availability table
CREATE TABLE IF NOT EXISTS agent_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    load_percentage INTEGER DEFAULT 0,
    last_health_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow executions (for n8n integration tracking)
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    execution_time_ms INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active, last_activity);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_session ON agent_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);

-- Insert default agents
INSERT INTO agents (id, name, type, description, capabilities, config) VALUES
    ('charlie-root-001', 'Charlie', 'root', 'Primary orchestrator and routing agent', 
     '["intent_classification", "agent_orchestration", "context_management"]',
     '{"maxConcurrency": 100, "timeout": 30000}'),
    ('restaurant-001', 'Restaurant Agent', 'restaurant', 'Handles dining and restaurant-related requests',
     '["reservations", "menu_inquiries", "recommendations"]', 
     '{"maxConcurrency": 50, "timeout": 15000}'),
    ('bank-001', 'Banking Agent', 'bank', 'Manages financial and banking requests',
     '["account_management", "payments", "financial_advice"]',
     '{"maxConcurrency": 30, "timeout": 20000}'),
    ('travel-001', 'Travel Agent', 'travel', 'Assists with travel planning and bookings',
     '["flight_booking", "hotel_reservation", "itinerary_planning"]',
     '{"maxConcurrency": 40, "timeout": 25000}'),
    ('healthcare-001', 'Healthcare Agent', 'healthcare', 'Helps with medical appointments and health services',
     '["appointment_booking", "health_advice", "prescription_management"]',
     '{"maxConcurrency": 20, "timeout": 30000}'),
    ('entertainment-001', 'Entertainment Agent', 'entertainment', 'Manages entertainment and event requests',
     '["event_booking", "recommendations", "ticket_purchases"]',
     '{"maxConcurrency": 60, "timeout": 15000}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    capabilities = EXCLUDED.capabilities,
    config = EXCLUDED.config,
    updated_at = NOW();

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

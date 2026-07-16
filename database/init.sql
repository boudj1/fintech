-- Enable pgvector if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'AGENT',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    address VARCHAR(255),
    city VARCHAR(50),
    country VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    assigned_agent_id BIGINT REFERENCES users(id),
    subject VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    channel VARCHAR(20) DEFAULT 'WEB',
    language VARCHAR(10) DEFAULT 'en',
    satisfaction_score INTEGER,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    sender_id BIGINT,
    sender_name VARCHAR(100),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    confidence_score DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge articles table
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    tags VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    author_id BIGINT REFERENCES users(id),
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'IN_APP',
    status VARCHAR(20) DEFAULT 'UNREAD',
    entity_type VARCHAR(50),
    entity_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'CUSTOM',
    status VARCHAR(20) DEFAULT 'PENDING',
    generated_by BIGINT,
    file_path VARCHAR(500),
    parameters TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Flyway schema history table placeholder (let flyway manage it)

-- Seed admin user (BCrypt hash of "admin")
INSERT INTO users (username, email, password, first_name, last_name, role, enabled)
VALUES ('admin', 'admin@enterprise.com', '$2a$10$PnzMmqa5p6tLZRoaQHXlwukh00chG6M4QkoT/lJOFV5fhN9NC98Ke', 'Admin', 'User', 'SUPER_ADMIN', true)
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;

-- Seed sample customers
INSERT INTO customers (first_name, last_name, email, company, status) VALUES
('Alice', 'Martin', 'alice.martin@example.com', 'Acme Corp', 'ACTIVE'),
('Bob', 'Johnson', 'bob.johnson@example.com', 'TechStart', 'ACTIVE'),
('Carol', 'Smith', 'carol.smith@example.com', 'GlobalTech', 'ACTIVE'),
('David', 'Lee', 'david.lee@example.com', 'Innovate Inc', 'ACTIVE'),
('Emma', 'Wilson', 'emma.wilson@example.com', 'FutureWorks', 'INACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Seed sample conversations
INSERT INTO conversations (customer_id, subject, status, channel)
SELECT c.id, 'General Inquiry', 'OPEN', 'WEB'
FROM customers c WHERE c.email = 'alice.martin@example.com'
ON CONFLICT DO NOTHING;

-- Seed knowledge articles
INSERT INTO knowledge_articles (title, content, category, status, is_featured) VALUES
('Getting Started Guide', 'Welcome to our Enterprise AI Platform. This guide will help you get started with all the features available. First, log in with your credentials and explore the dashboard for an overview of your account activity.', 'General', 'PUBLISHED', true),
('FAQ - Common Questions', 'Q: How do I reset my password? A: Click on Forgot Password on the login page. Q: How do I contact support? A: Use the chat feature or email support@enterprise.com. Q: Can I export my data? A: Yes, use the Reports section.', 'Support', 'PUBLISHED', true),
('How to Submit a Support Request', 'To submit a support request: 1. Navigate to Conversations. 2. Click New Conversation. 3. Describe your issue in detail. 4. Our AI will provide immediate assistance or connect you to an agent.', 'Support', 'PUBLISHED', false),
('Security Best Practices', 'Keep your account secure: Use strong passwords, enable 2FA when available, never share credentials, log out after each session, report suspicious activity immediately.', 'Security', 'PUBLISHED', false)
ON CONFLICT DO NOTHING;

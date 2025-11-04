-- IRL Assessment Platform - Supabase Database Initialization
-- Run this in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('startup', 'organization', 'admin')),
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create startup profiles table
CREATE TABLE IF NOT EXISTS startup_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    answers JSONB NOT NULL,
    scores JSONB NOT NULL,
    irl_level INTEGER NOT NULL,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create action plans table
CREATE TABLE IF NOT EXISTS action_plans (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    checklist JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_assessments_startup ON assessments(startup_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_plans_startup ON action_plans(startup_id);

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, user_type, name) VALUES 
('admin@irl.com', '$2a$10$YvQ8zqHZJGk5hGkF5XZvKOqB5nP0rP8xzZQ5J0qKZ5Q5J0qKZ5Q5J', 'admin', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Insert test organization (password: org123)
INSERT INTO users (email, password, user_type, name, organization) VALUES 
('org@example.com', '$2a$10$YvQ8zqHZJGk5hGkF5XZvKOqB5nP0rP8xzZQ5J0qKZ5Q5J0qKZ5Q5J', 'organization', 'Test Organization', 'Test Org Inc')
ON CONFLICT (email) DO NOTHING;

-- Insert test startup (password: startup123)
INSERT INTO users (email, password, user_type, name) VALUES 
('startup@example.com', '$2a$10$YvQ8zqHZJGk5hGkF5XZvKOqB5nP0rP8xzZQ5J0qKZ5Q5J0qKZ5Q5J', 'startup', 'Test Startup')
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Database initialized successfully!' AS status;
SELECT COUNT(*) AS total_users FROM users;

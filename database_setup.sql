-- =====================================================
-- Regulatory Intelligence Database Setup Script
-- =====================================================
-- This script creates all necessary tables and default data
-- Run this in pgAdmin4 or psql command line

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE regulatory_intelligence;

-- Connect to the regulatory_intelligence database
-- \c regulatory_intelligence;

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    jurisdiction VARCHAR(100),
    company_size VARCHAR(50),
    description TEXT,
    keywords TEXT[],
    compliance_requirements TEXT[],
    risk_tolerance VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trusted Sources table
CREATE TABLE IF NOT EXISTS trusted_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    source_type VARCHAR(50),
    reliability_score DECIMAL(3,2) DEFAULT 0.5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Profile Trusted Sources (many-to-many relationship)
CREATE TABLE IF NOT EXISTS company_profile_trusted_sources (
    company_profile_id INTEGER REFERENCES company_profiles(id) ON DELETE CASCADE,
    trusted_source_id INTEGER REFERENCES trusted_sources(id) ON DELETE CASCADE,
    PRIMARY KEY (company_profile_id, trusted_source_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    analysis_type VARCHAR(100),
    scope TEXT,
    keywords TEXT[],
    company_profile_id INTEGER REFERENCES company_profiles(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Regulatory Changes table
CREATE TABLE IF NOT EXISTS regulatory_changes (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    source_url VARCHAR(500),
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    impact_assessment TEXT,
    compliance_requirements TEXT,
    implementation_timeline VARCHAR(100),
    risk_level VARCHAR(20),
    confidence_score DECIMAL(3,2),
    relevant_sections TEXT[],
    affected_areas TEXT[],
    action_items TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis Sessions table
CREATE TABLE IF NOT EXISTS analysis_sessions (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    session_data JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Company Profiles indexes
CREATE INDEX IF NOT EXISTS idx_company_profiles_industry ON company_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_company_profiles_jurisdiction ON company_profiles(jurisdiction);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_company_profile_id ON reports(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Regulatory Changes indexes
CREATE INDEX IF NOT EXISTS idx_regulatory_changes_report_id ON regulatory_changes(report_id);
CREATE INDEX IF NOT EXISTS idx_regulatory_changes_risk_level ON regulatory_changes(risk_level);
CREATE INDEX IF NOT EXISTS idx_regulatory_changes_created_at ON regulatory_changes(created_at);

-- Analysis Sessions indexes
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_report_id ON analysis_sessions(report_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_status ON analysis_sessions(status);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (email, username, hashed_password, full_name, is_active, is_superuser) 
VALUES (
    'admin@example.com',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8Kz2',
    'Administrator',
    TRUE,
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Insert sample trusted sources
INSERT INTO trusted_sources (name, url, source_type, reliability_score) VALUES
('SEC.gov', 'https://www.sec.gov', 'government', 0.95),
('Federal Register', 'https://www.federalregister.gov', 'government', 0.90),
('EU Official Journal', 'https://eur-lex.europa.eu', 'government', 0.90),
('UK Legislation', 'https://www.legislation.gov.uk', 'government', 0.85),
('Financial Times', 'https://www.ft.com', 'news', 0.80),
('Reuters', 'https://www.reuters.com', 'news', 0.75),
('Bloomberg', 'https://www.bloomberg.com', 'news', 0.70)
ON CONFLICT DO NOTHING;

-- Insert sample company profile
INSERT INTO company_profiles (company_name, industry, jurisdiction, company_size, description, keywords, compliance_requirements, risk_tolerance) VALUES
(
    'TechCorp Inc.',
    'Technology',
    'United States',
    'Large',
    'A leading technology company specializing in software development and cloud services.',
    ARRAY['software', 'cloud', 'data privacy', 'cybersecurity', 'AI'],
    ARRAY['SOX', 'GDPR', 'CCPA', 'HIPAA'],
    'low'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify admin user was created
SELECT username, email, is_active, is_superuser 
FROM users 
WHERE username = 'admin';

-- Verify trusted sources were created
SELECT name, source_type, reliability_score 
FROM trusted_sources 
ORDER BY reliability_score DESC;

-- Verify company profile was created
SELECT company_name, industry, jurisdiction, company_size 
FROM company_profiles;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database setup completed successfully! 🎉' as message;
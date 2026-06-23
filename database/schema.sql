-- Drop tables in correct order (reverse dependencies)
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS portfolio_entries CASCADE;
DROP TABLE IF EXISTS ai_checks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_hours CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    student_number VARCHAR(20),
    password_hash TEXT NOT NULL,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User available hours
CREATE TABLE user_hours (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    weekdays JSONB,
    weekends JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    code VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('assignment', 'exam', 'project', 'personal')),
    description TEXT,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted')),
    hours_estimated INTEGER DEFAULT 0,
    hours_spent INTEGER DEFAULT 0,
    ai_risk VARCHAR(10) DEFAULT 'low' CHECK (ai_risk IN ('low', 'medium', 'high')),
    next_action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    estimated_minutes INTEGER DEFAULT 60,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Guard checks log
CREATE TABLE ai_checks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    original_text TEXT,
    score INTEGER,
    verdict VARCHAR(20) CHECK (verdict IN ('safe', 'review', 'rewrite')),
    humanized_text TEXT,
    suggestions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio entries
CREATE TABLE portfolio_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    content TEXT,
    bullet_point TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly reports
CREATE TABLE weekly_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    week_start DATE,
    week_end DATE,
    report_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_ai_checks_user_id ON ai_checks(user_id);
CREATE INDEX idx_ai_checks_created_at ON ai_checks(created_at);
CREATE INDEX idx_portfolio_entries_user_id ON portfolio_entries(user_id);
CREATE INDEX idx_weekly_reports_user_id ON weekly_reports(user_id);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_hours_updated_at BEFORE UPDATE ON user_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
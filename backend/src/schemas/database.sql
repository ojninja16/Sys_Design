-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generation jobs 
CREATE TABLE generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    prompt TEXT NOT NULL,
    app_type VARCHAR(50) DEFAULT 'other',
    complexity VARCHAR(20) DEFAULT 'moderate',
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    files_s3_key VARCHAR(500), -- S3 key for generated files zip
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);


-- Basic indexes
CREATE INDEX idx_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX idx_jobs_status ON generation_jobs(status);

-- Sample data
INSERT INTO users (email, name) VALUES
('demo@example.com', 'Demo User'),
('test@example.com', 'Test User');

-- Sample job
INSERT INTO generation_jobs (user_id, prompt, app_type, status) VALUES
(1, 'Build me a todo app', 'crud', 'completed');
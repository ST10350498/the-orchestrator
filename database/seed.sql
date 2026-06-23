-- Sample data for testing
INSERT INTO users (name, email, student_number, password_hash, onboarding_complete)
VALUES 
('Test User', 'test@example.com', 'ST99999999', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr4iZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5', true);

-- Sample project
INSERT INTO projects (user_id, code, title, type, due_date, status, hours_estimated)
VALUES 
(1, 'TEST-A1', 'Test Assignment 1', 'assignment', CURRENT_DATE + INTERVAL '7 days', 'in_progress', 10);

-- Sample tasks
INSERT INTO tasks (project_id, title, estimated_minutes)
VALUES 
(1, 'Research topic', 120),
(1, 'Write draft', 180),
(1, 'Review and submit', 60);
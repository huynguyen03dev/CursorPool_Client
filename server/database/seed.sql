-- Sample test user (password: test123)
INSERT INTO users (email, username, password_hash, level, total_count, used_count, expire_time) VALUES
('test@example.com', 'testuser', '$2b$10$rQ8L8xGxGxGxGxGxGxGxGuO8L8xGxGxGxGxGxGxGxGxGxGxGxGxGx', 1, 100, 0, datetime('now', '+30 days'));

-- Sample accounts pool (2-3 accounts)
INSERT INTO accounts_pool (account, password, token, usage_count, status) VALUES
('cursor_account1@example.com', 'password123', 'sample_token_1', 0, 1),
('cursor_account2@example.com', 'password456', 'sample_token_2', 0, 1),
('cursor_account3@example.com', 'password789', 'sample_token_3', 0, 1);

-- Sample activation codes (5 codes)
INSERT INTO activation_codes (code, type, name, level, duration, quota, max_uses, used_count, status, notes) VALUES
('WELCOME2024', 'trial', 'New User Trial Code', 1, 7, 100, 100, 0, 1, '7-day trial, 100 credits'),
('PREMIUM30', 'premium', 'Premium Monthly Membership', 2, 30, 500, 500, 0, 1, '30-day premium membership, 500 credits'),
('UNLIMITED90', 'vip', 'VIP Quarterly Card', 3, 90, 2000, 2000, 5, 1, '90-day VIP membership, 2000 credits'),
('STUDENT2024', 'student', 'Student Discount Code', 1, 180, 1000, 1000, 12, 1, 'Student exclusive, 6 months 1000 credits'),
('TESTCODE', 'test', 'Test Activation Code', 0, 1, 10, 10, 0, 1, 'Single-use test activation code');

-- Sample articles
INSERT INTO articles (title, content, author, status) VALUES
('Welcome to CursorPool', '# Welcome to CursorPool\n\nCursorPool is an intelligent Cursor IDE account management tool.\n\n## Main Features\n- Automatic account rotation\n- Credit management\n- Multi-account support', 'Admin', 1),
('User Guide', '# CursorPool User Guide\n\n1. Register account\n2. Activate membership\n3. Start using\n\nFor detailed instructions, please check the documentation.', 'Admin', 1),
('Frequently Asked Questions', '# Frequently Asked Questions\n\n**Q: How to activate account?**\nA: Use activation code in settings page.\n\n**Q: How are credits calculated?**\nA: Each request consumes 1 credit.', 'Admin', 1);

-- Sample public info (announcement)
INSERT INTO public_info (key, value, type, status) VALUES
('announcement', 'System running normally, welcome to use CursorPool!', 'text', 1),
('version', '1.0.0', 'text', 1),
('maintenance', 'false', 'boolean', 1);

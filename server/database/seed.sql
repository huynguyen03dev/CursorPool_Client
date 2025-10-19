-- Sample test user (password: test123)
INSERT INTO users (email, username, password_hash, level, total_count, used_count, expire_time) VALUES
('test@example.com', 'testuser', '$2b$10$rQ8L8xGxGxGxGxGxGxGxGuO8L8xGxGxGxGxGxGxGxGxGxGxGxGxGx', 1, 100, 0, datetime('now', '+30 days'));

-- Sample accounts pool (2-3 accounts)
INSERT INTO accounts_pool (account, password, token, usage_count, status) VALUES
('cursor_account1@example.com', 'password123', 'sample_token_1', 0, 1),
('cursor_account2@example.com', 'password456', 'sample_token_2', 0, 1),
('cursor_account3@example.com', 'password789', 'sample_token_3', 0, 1);

-- Sample activation codes (5 codes)
INSERT INTO activation_codes (code, type, name, level, duration, max_uses, used_count, status, notes) VALUES
('WELCOME2024', 'trial', '新用户试用码', 1, 7, 100, 0, 1, '7天试用，100次额度'),
('PREMIUM30', 'premium', '高级会员月卡', 2, 30, 500, 0, 1, '30天高级会员，500次额度'),
('UNLIMITED90', 'vip', 'VIP季度卡', 3, 90, 2000, 5, 1, '90天VIP会员，2000次额度'),
('STUDENT2024', 'student', '学生优惠码', 1, 180, 1000, 12, 1, '学生专属，半年1000次'),
('TESTCODE', 'test', '测试激活码', 0, 1, 10, 0, 1, '测试用单次激活码');

-- Sample articles
INSERT INTO articles (title, content, author, status) VALUES
('欢迎使用 CursorPool', '# 欢迎使用 CursorPool\n\nCursorPool 是一个智能的 Cursor IDE 账号管理工具。\n\n## 主要特性\n- 自动账号轮换\n- 额度管理\n- 多账号支持', 'Admin', 1),
('使用指南', '# CursorPool 使用指南\n\n1. 注册账号\n2. 激活会员\n3. 开始使用\n\n详细说明请查看文档。', 'Admin', 1),
('常见问题解答', '# 常见问题\n\n**Q: 如何激活账号？**\nA: 使用激活码在设置页面激活。\n\n**Q: 额度如何计算？**\nA: 每次请求消耗1次额度。', 'Admin', 1);

-- Sample public info (announcement)
INSERT INTO public_info (key, value, type, status) VALUES
('announcement', '系统运行正常，欢迎使用 CursorPool！', 'text', 1),
('version', '1.0.0', 'text', 1),
('maintenance', 'false', 'boolean', 1);

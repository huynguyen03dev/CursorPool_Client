-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  password_hash TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  expire_time DATETIME,
  spread TEXT DEFAULT '0',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_expire_time ON users(expire_time);

-- Email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_email ON email_verification_codes(email);
CREATE INDEX idx_verification_expires ON email_verification_codes(expires_at);

-- Accounts pool table
CREATE TABLE IF NOT EXISTS accounts_pool (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account TEXT NOT NULL,
  password TEXT NOT NULL,
  token TEXT,
  usage_count INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  distributed_time DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_status ON accounts_pool(status);
CREATE INDEX idx_accounts_usage ON accounts_pool(usage_count);

-- Activation codes table
CREATE TABLE IF NOT EXISTS activation_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  name TEXT,
  level INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  quota INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  notes TEXT,
  activated_at DATETIME,
  expired_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activation_code ON activation_codes(code);
CREATE INDEX idx_activation_status ON activation_codes(status);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  status INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_status ON articles(status);

-- Bug reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  email TEXT,
  description TEXT NOT NULL,
  status INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_bug_reports_status ON bug_reports(status);

-- Public info table
CREATE TABLE IF NOT EXISTS public_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT,
  status INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_public_info_key ON public_info(key);
CREATE INDEX idx_public_info_status ON public_info(status);
